"use strict";

const http = require("http");
const fs = require("fs");
const ws = require("ws");
const path = require("path");

import { DOG6, DOG8, WIZARD, GameConfig } from "./GameConfig";

const httpPort = 8000;
const wsPort = 8080;

// TODO: Reify client state into a proper class with its own methods
// for union, difference, equality, hashing, copying (!), and applying
// of atomic changes.

const KLASSES = [
  "avatars",
  "boards",
  "marbles",
  "notepads",
  "privateAreas",
  "decks",
  "cards",
];

let _wsServer = null;
let _httpServer = null;
let _runningGames = {};

function initHTTPServer() {
  // HTTP Server mostly based on:
  // https://www.digitalocean.com/community/tutorials/
  // how-to-create-a-web-server-in-node-js-with-the-http-module

  _httpServer = http.createServer(handleHTTPRequest);

  // Bind HTTP server to :: which accetps both IPV4 as well as
  // IPV6 connections. Otherwise chrome will try the IPV6 localhost
  // address when developing first and timeout only after a long
  // time before trying the IPV4 which our server answers to.

  _httpServer.listen(httpPort, "::", () => {
    console.log(`Server is running on http://:::${httpPort}`);
  });
}

function handleHTTPRequest(req, res) {
  const [filename, params] = parseUrl(req.url);
  if (filename === "/") {
    // It is not necessary to normalize the path here. However, to make
    // sure that all paths are properly escaped before opening one might grep
    // the source code for readFile and make sure each call contains a
    // path.normalize. In that case its easier to have no exceptions and escape
    // the literal string anyhow.
    fs.readFile(path.normalize("html/index.html"), {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  } else if (filename === "/reset") {
    resetGame(params.game);
    res.setHeader("Content-Type", "text/plain");
    res.writeHead(200);
    res.end();
  } else if (filename.endsWith(".css")) {
    fs.readFile("css" + path.normalize(filename), {}, function (err, data) {
      res.setHeader("Content-Type", "text/css");
      res.writeHead(200);
      res.end(data);
    });
  } else if (filename.endsWith(".html")) {
    fs.readFile("html" + path.normalize(filename), {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  } else if (filename.endsWith(".js")) {
    fs.readFile("dist" + path.normalize(filename), {}, function (err, data) {
      res.setHeader("Content-Type", "text/javascript");
      res.writeHead(200);
      res.end(data);
    });
  } else if (filename.endsWith(".png")) {
    fs.readFile("img" + path.normalize(filename), {}, function (err, data) {
      res.setHeader("Content-Type", "image/png");
      res.writeHead(200);
      res.end(data);
    });
  } else if (filename.endsWith(".jpeg")) {
    fs.readFile("img" + path.normalize(filename), {}, function (err, data) {
      res.setHeader("Content-Type", "image/jpeg");
      res.writeHead(200);
      res.end(data);
    });
  } else {
    res.setHeader("Content-Type", "text/plain");
    res.writeHead(404);
    res.end();
  }
}

function initWebSocketServer() {
  // SocketServer mostly based on:
  // https://www.npmjs.com/package/ws#sending-and-receiving-text-data

  // Bind WS server to :: which accetps both IPV4 as well as
  // IPV6 connections. Otherwise chrome will try the IPV6 localhost
  // address when developing first and timeout only after a long
  // time before trying the IPV4 which our server answers to.

  _wsServer = new ws.Server({ host: "::", port: wsPort });

  _wsServer.on("connection", function (socket, request) {
    socket.on("message", function (msg) {
      handleClientMessage(socket, msg);
    });

    socket.on("close", function () {
      handleClientDisconnected(socket);
    });
  });
}

// The method assembleBoard will be called by handleHTTPRequest with boardId
// set by the ?board=Dog query parameter.

function assembleBoard(boardId, gameId) {
  if (boardId === "Dog6") {
    return new GameConfig(DOG6, boardId, gameId).hydrate();
  } else if (boardId === "Dog8") {
    return new GameConfig(DOG8, boardId, gameId).hydrate();
  } else if (boardId === "Wizard") {
    return new GameConfig(WIZARD, boardId, gameId).hydrate();
  } else {
    throw new Error("Board not implemented");
  }
}

function resetGame(gameId) {
  // Get new board and step ticks forward to force clients
  // to accept changes.

  const game = _runningGames[gameId];
  if (_runningGames === undefined) {
    return;
  }

  const board = assembleBoard(game.boardId, gameId);
  for (const klass of KLASSES) {
    for (const [key, item] of Object.entries(board[klass])) {
      item.tick = game.scene.tick;
    }
  }
  game.scene = board;

  console.log("Reloaded", gameId);
}

function handleClientMessage(socket, msg) {
  const scene = JSON.parse(msg);

  // If the clients does not even specify a board, set a
  // reasonable default.

  const boardId = scene.boardId || "Dog6";
  const gameId = scene.gameId || "Game-" + randomId(8);
  const playerId = scene.playerId || "Player-" + randomId(8);
  const clientId = scene.clientId || "Client-" + randomId(8);

  // If there is no such game, create it

  if (_runningGames.hasOwnProperty(gameId) === false) {
    const board = assembleBoard(boardId, gameId);

    _runningGames[gameId] = {
      clients: {},
      scene: board,
      boardId: boardId,
    };
    console.log(playerId, "created", gameId, "playing", boardId);
  }

  // If player not yet part of game, join
  if (!_runningGames[gameId].clients.hasOwnProperty(clientId)) {
    _runningGames[gameId].clients[clientId] = {
      playerId: playerId,
      socket: socket,
      scene: scene,
    };
    console.log(clientId, playerId, "joined", gameId, "playing", boardId);
  }

  // Keep server tick ahead of all client ticks.
  _runningGames[gameId].scene.tick = Math.max(
    _runningGames[gameId].scene.tick,
    scene.tick
  );

  // Update both the authorative game state of the server and our
  // view of the game state of the specific clientId.

  unionLeft(_runningGames[gameId].scene, scene);
  unionLeft(_runningGames[gameId].clients[clientId].scene, scene);
}

function sendServerMessage() {
  for (const [gameId, game] of Object.entries(_runningGames)) {
    // Each time a scene is announced to all, increase ticks for this game
    game.scene.tick += 1;

    // Propagate changes to all players
    for (const [clientId, client] of Object.entries(game.clients)) {
      const scene = differenceTo(
        game.scene,
        client.scene,
        client.playerId,
        clientId
      );
      client.socket.send(JSON.stringify(scene));

      // Assume the client received our update and send only differences later.
      // TODO: Better keep track of last known tick.

      // DO NOT USE client.scene = game.scene here, as client.scene
      // then simply becomes a reference onto game.scene and reflects
      // all of its modifications!
      unionLeft(client.scene, scene);
    }
  }
}

function handleClientDisconnected(socket) {
  for (const [gid, game] of Object.entries(_runningGames)) {
    for (const [clientId, client] of Object.entries(game.clients)) {
      if (client.socket === socket) {
        delete game.clients[clientId];
      }
    }
  }
}

function unionLeft(local, remote) {
  local.tick = Math.max(local.tick, remote.tick);

  for (const klass of KLASSES) {
    for (const key of Object.keys(remote[klass])) {
      if (
        !local[klass].hasOwnProperty(key) ||
        remote[klass][key].tick > local[klass][key].tick
      ) {
        local[klass][key] = remote[klass][key];
      }
    }
  }
}

function differenceTo(local, remote, playerId, clientId) {
  const changes = {
    tick: local.tick,
    boardId: local.boardId,
    gameId: local.gameId,
    playerId: playerId,
    clientId: clientId,
    avatars: {},
    boards: {},
    marbles: {},
    notepads: {},
    privateAreas: {},
    decks: {},
    cards: {},
  };

  for (const klass of KLASSES) {
    for (const key of Object.keys(local[klass])) {
      // FIXME: For proper vector timestamps _both_ the (clientId, tick)
      // are relevant, as tick !== tick if it comes from different clients.
      // This is the only place we actually enforce this break ties in
      // favor of the server (local). Done correctly, any comparison of
      // ticks anywhere needs to take clientId into account.
      // TODO: Implement proper VectorClock / LamportTimestamp class.
      if (
        !remote[klass].hasOwnProperty(key) ||
        local[klass][key].owner !== remote[klass][key].owner ||
        local[klass][key].tick > remote[klass][key].tick
      ) {
        changes[klass][key] = local[klass][key];
      }
    }
  }

  return changes;
}

function parseUrl(url) {
  let filename = null;
  let parameters = {};

  const pathQuery = url.split("?");

  if (pathQuery.length === 1) {
    filename = pathQuery[0];
  } else {
    filename = pathQuery[0];
    const parts = pathQuery[1].split("&");

    for (const p of parts) {
      const keyValue = p.split("=");
      if (keyValue.length === 1) {
        parameters[keyValue[0]] = true;
      } else {
        parameters[keyValue[0]] = keyValue[1];
      }
    }
  }

  return [filename, parameters];
}

function randomId(n) {
  const symbols = "abcdefghijklmnopqrstuvwxyzABCDEFGHUJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < n; i++) {
    result = result + symbols[Math.floor(Math.random() * symbols.length)];
  }
  return result;
}

initHTTPServer();
initWebSocketServer();

// Clients have no tick and are driven by the server.
setInterval(sendServerMessage, 300);
