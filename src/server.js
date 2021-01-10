"use strict";

const http = require("http");
const fs = require("fs");
const ws = require("ws");
const path = require("path");

const httpPort = 8000;
const wsPort = 8080;

let _wsServer = null;
let _httpServer = null;
let _runningGames = {};
let _countClientsSeen = 0;

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
  } else if (filename === "/reload") {
    reloadGame(params.game);
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

function assembleBoard(boardId) {
  const board = {};
  const assembly = JSON.parse(
    fs.readFileSync("boards/" + path.normalize(boardId) + ".json")
  );
  for (const partName of assembly) {
    const part = JSON.parse(
      fs.readFileSync("boards/" + path.normalize(partName) + ".json")
    );
    for (const [trait, props] of Object.entries(part)) {
      if (board.hasOwnProperty(trait) === false) {
        board[trait] = {};
      }
      for (const [item, prop] of Object.entries(props)) {
        board[trait][item] = prop;
      }
    }
  }
  return board;
}

function reloadGame(gameId) {
  // Get new board and step ticks forward to force clients
  // to accept changes.

  if (_runningGames.hasOwnProperty(gameId) === false) {
    return;
  }

  const board = assembleBoard(_runningGames[gameId].boardId);
  for (const [trait, items] of Object.entries(board)) {
    for (const [i, item] of Object.entries(items)) {
      item.tick = _runningGames[gameId].tick;
    }
  }

  _runningGames[gameId].scene = board;
  console.log("Reloaded", gameId);
}

function handleClientMessage(socket, msg) {
  msg = JSON.parse(msg);

  const boardId = msg.boardId || "Dog";
  const gameId = msg.gameId || "Game-" + randomId(8);
  const playerId = msg.playerId || "Player-" + randomId(8);

  // If there is no such game, create it
  if (_runningGames.hasOwnProperty(gameId) === false) {
    const board = assembleBoard(boardId);

    _runningGames[gameId] = {
      tick: 1,
      sockets: {},
      boardId: boardId,
      scene: board,
    };
    console.log(playerId, "created", gameId, "playing", boardId);
  }

  // If player not yet part of game, join
  if (_runningGames[gameId].sockets.hasOwnProperty(playerId) === false) {
    _runningGames[gameId].sockets[playerId] = socket;
    console.log(playerId, "joined", gameId, "playing", boardId);
  }

  // Step tick forward is client is ahead of us. Client may have
  // a newer state if the server failed and dis-connected during
  // a game. Never regress tick of clients. Server tick and client
  // tick behave like a Lamport timestamp.

  _runningGames[gameId].tick = Math.max(_runningGames[gameId].tick, msg.tick);

  // Synchronize with client
  for (const [key, values] of Object.entries(msg.scene)) {
    _runningGames[gameId].scene[key] = unionLastWriterWins(
      msg.scene[key] || {},
      _runningGames[gameId].scene[key] || {}
    );
  }
}

function sendServerMessage() {
  for (const [gameId, game] of Object.entries(_runningGames)) {
    // Each time a scene is announced to all, increase ticks for this game
    game.tick += 1;
    // Propagate changes to all players
    for (const [playerId, clientSocket] of Object.entries(game.sockets)) {
      const msg = {
        boardId: game.boardId,
        gameId: gameId,
        playerId: playerId,
        tick: game.tick,
        scene: game.scene,
      };
      clientSocket.send(JSON.stringify(msg));
    }
  }
}

function handleClientDisconnected(socket) {
  for (const [gid, game] of Object.entries(_runningGames)) {
    for (const [pid, s] of Object.entries(game.sockets)) {
      if (s === socket) {
        delete _runningGames[gid].sockets[pid];
      }
    }
  }
}

/** Union two LWWMaps returning a copy of the superset.
 *
 * The union is biased towards state2 on equal tick counts of both,
 * by performing the merging of state2 onto result secondary and
 * avoid an explicit lesser equals check there.
 *
 */
function unionLastWriterWins(state1, state2) {
  const result = {};

  for (const key of Object.keys(state2)) {
    if (state1.hasOwnProperty(key) && state1[key].tick > state2[key].tick) {
      continue;
    }
    result[key] = {};
    for (const [prop, value] of Object.entries(state2[key])) {
      result[key][prop] = value;
    }
  }

  for (const key of Object.keys(state1)) {
    if (state2.hasOwnProperty(key) && state2[key].tick > state1[key].tick) {
      continue;
    }
    result[key] = {};
    for (const [prop, value] of Object.entries(state1[key])) {
      result[key][prop] = value;
    }
  }

  return result;
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
