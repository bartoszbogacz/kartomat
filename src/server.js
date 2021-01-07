"use strict";

const http = require("http");
const fs = require("fs");
const ws = require("ws");

const httpHost = "";
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

  _httpServer.listen(httpPort, httpHost, () => {
    console.log(`Server is running on http://${httpHost}:${httpPort}`);
  });
}

function handleHTTPRequest(req, res) {
  const [path, params] = parseUrl(req.url);
  console.log(path, params);
  if (path === "/") {
    fs.readFile("html/index.html", {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".css")) {
    fs.readFile("css" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "text/css");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".html")) {
    fs.readFile("html" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".js")) {
    fs.readFile("dist" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "text/javascript");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".png")) {
    fs.readFile("img" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "image/png");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".jpeg")) {
    fs.readFile("img" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "image/jpeg");
      res.writeHead(200);
      res.end(data);
    });
  }
}

function initWebSocketServer() {
  // SocketServer mostly based on:
  // https://www.npmjs.com/package/ws#sending-and-receiving-text-data

  _wsServer = new ws.Server({ port: wsPort });

  _wsServer.on("connection", function (socket, request) {
    socket.on("message", function (msg) {
      handleClientMessage(socket, msg);
    });

    socket.on("close", function () {
      handleClientDisconnected(socket);
    });
  });
}

function handleClientMessage(socket, msg) {
  msg = JSON.parse(msg);

  const boardId = msg.boardId || "dog";
  const gameId = msg.gameId || generateGameId();
  const playerId = msg.playerId || generatePlayerId();

  // If there is no such game, create it
  if (_runningGames.hasOwnProperty(gameId) === false) {
    const board = assembleBoard(boardId);

    _runningGames[gameId] = {
      tick: 1,
      sockets: {},
      boardId: boardId,
      scene: board,
    };
    console.log("Created game", gameId, "on", boardId);
  }

  // If player not yet part of game, join
  if (_runningGames[gameId].sockets.hasOwnProperty(playerId) === false) {
    _runningGames[gameId].sockets[playerId] = socket;
    console.log("Client", playerId, "joined", gameId, "on", boardId);
  }

  // Synchronize with client
  for (const [key, values] of Object.entries(msg.scene)) {
    _runningGames[gameId].scene[key] = unionLastWriterWins(
      msg.scene[key] || {},
      _runningGames[gameId].scene[key] || {}
    );
  }
}

function assembleBoard(boardId) {
  const board = {};
  const assembly = JSON.parse(fs.readFileSync("boards/" + boardId + ".json"));
  for (const partName of assembly) {
    const part = JSON.parse(fs.readFileSync("boards/" + partName + ".json"));
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
  let path = null;
  let parameters = {};

  const pathQuery = url.split("?");

  if (pathQuery.length === 1) {
    path = pathQuery[0];
  } else {
    path = pathQuery[0];
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

  return [path, parameters];
}

function generatePlayerId() {
  _countClientsSeen += 1;
  return "player" + _countClientsSeen;
}

function generateGameId() {
  return "game" + Object.keys(_runningGames).length + 1;
}

initHTTPServer();
initWebSocketServer();

// Clients have no tick and are driven by the server.
setInterval(sendServerMessage, 100);
