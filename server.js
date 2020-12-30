"use strict";

/*
  Modules
*/

const http = require("http");
const fs = require("fs");
const ws = require("ws");

/*
  Global State
*/

let runningGames = {};

let _countClientsSeen = 0;

function generatePlayerId() {
  _countClientsSeen += 1;
  return "player" + _countClientsSeen;
}

function generateGameId() {
  return "game" + Object.keys(runningGames).length + 1;
}

/*
  Establishing a connection and joining a game
*/

function handleHTTPRequest(req, res) {
  const [path, params] = parseUrl(req.url);
  console.log(path, params);
  if (path === "/") {
    fs.readFile("index.html", {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path === "/client.html") {
    fs.readFile("client.html", {}, function (err, data) {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path === "/client.js") {
    fs.readFile("client.js", {}, function (err, data) {
      res.setHeader("Content-Type", "text/javascript");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path === "/client.css") {
    fs.readFile("client.css", {}, function (err, data) {
      res.setHeader("Content-Type", "text/css");
      res.writeHead(200);
      res.end(data);
    });
  }
  if (path.endsWith(".png")) {
    fs.readFile("images" + path, {}, function (err, data) {
      res.setHeader("Content-Type", "image/png");
      res.writeHead(200);
      res.end(data);
    });
  }
}

function handleSocketConnection(socket, request) {
  socket.on("message", function (msg) {
    const obj = JSON.parse(msg);
    if (obj.request === "joinGame") {
      handleJoinGame(socket, obj);
    }
    if (obj.request === "modifyScene") {
      handleModifyScene(obj);
    }
  });

  socket.on("close", function () {
    clientDisconnected(socket);
  });
}

function handleJoinGame(socket, msg) {
  const boardId = msg.boardId;
  const gameId = msg.gameId || generateGameId();
  const playerId = msg.playerId || generatePlayerId();

  var board = JSON.parse(fs.readFileSync(boardId + ".json"));

  if (!runningGames.hasOwnProperty(gameId)) {
    runningGames[gameId] = {
      ticks: 0,
      sockets: {},
      scene: board,
    };
  }

  // Attach player socket
  runningGames[gameId].sockets[playerId] = socket;

  // Grab empty playerAvatar if player never joined game yet
  let isPlayerKnown = false;
  for (const [playerAvatarId, playerAvatar] of Object.entries(
    runningGames[gameId].scene
  )) {
    if (playerAvatar.represents === playerId) {
      isPlayerKnown = true;
      break;
    }
  }
  if (isPlayerKnown === false) {
    for (const [playerAvatarId, playerAvatar] of Object.entries(
      runningGames[gameId].scene
    )) {
      if (playerAvatar.represents === null) {
        playerAvatar.represents = playerId;
        break;
      }
    }
  }

  const resp = {
    announce: "gameJoined",
    boardId: boardId,
    gameId: gameId,
    playerId: playerId,
  };
  runningGames[gameId].sockets[playerId].send(JSON.stringify(resp));

  console.log("Client", playerId, "joined", gameId, "on", boardId);
}

function clientDisconnected(socket) {
  for (const [gid, game] of Object.entries(runningGames)) {
    for (const [pid, s] of Object.entries(game.sockets)) {
      if (s === socket) {
        delete runningGames[gid].sockets[pid];
      }
    }
  }
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

/*
  Synchronization Protocol
*/

function handleModifyScene(msg) {
  const gameId = msg.gameId;
  const game = runningGames[gameId];
  const playerId = msg.playerId;
  const changes = msg.changes;

  for (const [thingId, diff] of Object.entries(changes)) {
    const thing = runningGames[gameId].scene[thingId];
    if (
      thing.ownedBy !== null &&
      thing.ownedBy !== playerId &&
      thing.upToTick + 5 > game.ticks
    ) {
      continue;
    }

    for (const [prop, value] of Object.entries(diff)) {
      game.scene[thingId][prop] = value;
    }

    // Record that thing has been update while also
    // overwriting this value set by player
    thing.upToTick = game.ticks;
  }
}

function announceSceneModified() {
  for (const [gameId, game] of Object.entries(runningGames)) {
    // Each time a scene is announced to all, increase ticks for this game
    game.ticks += 1;
    // Propagate changes to all players
    for (const [playerId, clientSocket] of Object.entries(game.sockets)) {
      const msg = {
        announce: "sceneModified",
        gameId: gameId,
        playerId: playerId,
        ticks: game.ticks,
        scene: game.scene,
      };
      clientSocket.send(JSON.stringify(msg));
    }
  }
}

/*
  Initialization

SocketServer mostly based on:
https://www.npmjs.com/package/ws#sending-and-receiving-text-data

HTTP Server mostly based on:
https://www.digitalocean.com/community/tutorials/
how-to-create-a-web-server-in-node-js-with-the-http-module
*/

const httpHost = "";
const httpPort = 8000;
const wsPort = 8080;

const wsServer = new ws.Server({ port: wsPort });

wsServer.on("connection", handleSocketConnection);

const httpServer = http.createServer(handleHTTPRequest);

httpServer.listen(httpPort, httpHost, () => {
  console.log(`Server is running on http://${httpHost}:${httpPort}`);
});

/*
  Server Tick

Clients have no tick and are driven by the server.
*/

setInterval(announceSceneModified, 1000);
