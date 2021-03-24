"use strict";

const http = require("http");
const fs = require("fs");
const ws = require("ws");
const path = require("path");

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

function generateAvatars(scene, count) {
  const xys = [
    [920, 30],
    [1130, 30],
    [920, 70],
    [1130, 70],
    [920, 110],
    [1130, 110],
    [920, 150],
    [1130, 150],
  ];

  for (let i = 0; i < count; i++) {
    scene["avatars"]["avatar" + (i + 1)] = {
      tick: 1,
      owner: null,
      x: xys[i][0],
      y: xys[i][1],
      w: 200,
      h: 30,
      z: 0,
      l: 0,
      represents: null,
      text: "Player" + (i + 1),
    };
  }
}

function generateMarbles(scene, xycs) {
  for (let i = 0; i < xycs.length; i++) {
    scene["marbles"]["marble" + (i + 1)] = {
      tick: 1,
      owner: null,
      x: xycs[i][0],
      y: xycs[i][1],
      w: 20,
      h: 20,
      z: 0,
      l: 2,
      color: xycs[i][2],
    };
  }
}

function generateRummy(scene) {
  const images = [
    ["rummy/club_1.png", "rummy/back_blue.png"],
    ["rummy/club_2.png", "rummy/back_blue.png"],
    ["rummy/club_3.png", "rummy/back_blue.png"],
    ["rummy/club_4.png", "rummy/back_blue.png"],
    ["rummy/club_5.png", "rummy/back_blue.png"],
    ["rummy/club_6.png", "rummy/back_blue.png"],
    ["rummy/club_7.png", "rummy/back_blue.png"],
    ["rummy/club_8.png", "rummy/back_blue.png"],
    ["rummy/club_9.png", "rummy/back_blue.png"],
    ["rummy/club_10.png", "rummy/back_blue.png"],
    ["rummy/club_jack.png", "rummy/back_blue.png"],
    ["rummy/club_queen.png", "rummy/back_blue.png"],
    ["rummy/club_king.png", "rummy/back_blue.png"],
    ["rummy/diamond_1.png", "rummy/back_blue.png"],
    ["rummy/diamond_2.png", "rummy/back_blue.png"],
    ["rummy/diamond_3.png", "rummy/back_blue.png"],
    ["rummy/diamond_4.png", "rummy/back_blue.png"],
    ["rummy/diamond_5.png", "rummy/back_blue.png"],
    ["rummy/diamond_6.png", "rummy/back_blue.png"],
    ["rummy/diamond_7.png", "rummy/back_blue.png"],
    ["rummy/diamond_8.png", "rummy/back_blue.png"],
    ["rummy/diamond_9.png", "rummy/back_blue.png"],
    ["rummy/diamond_10.png", "rummy/back_blue.png"],
    ["rummy/diamond_jack.png", "rummy/back_blue.png"],
    ["rummy/diamond_queen.png", "rummy/back_blue.png"],
    ["rummy/diamond_king.png", "rummy/back_blue.png"],
    ["rummy/heart_1.png", "rummy/back_blue.png"],
    ["rummy/heart_2.png", "rummy/back_blue.png"],
    ["rummy/heart_3.png", "rummy/back_blue.png"],
    ["rummy/heart_4.png", "rummy/back_blue.png"],
    ["rummy/heart_5.png", "rummy/back_blue.png"],
    ["rummy/heart_6.png", "rummy/back_blue.png"],
    ["rummy/heart_7.png", "rummy/back_blue.png"],
    ["rummy/heart_8.png", "rummy/back_blue.png"],
    ["rummy/heart_9.png", "rummy/back_blue.png"],
    ["rummy/heart_10.png", "rummy/back_blue.png"],
    ["rummy/heart_jack.png", "rummy/back_blue.png"],
    ["rummy/heart_queen.png", "rummy/back_blue.png"],
    ["rummy/heart_king.png", "rummy/back_blue.png"],
    ["rummy/spade_1.png", "rummy/back_blue.png"],
    ["rummy/spade_2.png", "rummy/back_blue.png"],
    ["rummy/spade_3.png", "rummy/back_blue.png"],
    ["rummy/spade_4.png", "rummy/back_blue.png"],
    ["rummy/spade_5.png", "rummy/back_blue.png"],
    ["rummy/spade_6.png", "rummy/back_blue.png"],
    ["rummy/spade_7.png", "rummy/back_blue.png"],
    ["rummy/spade_8.png", "rummy/back_blue.png"],
    ["rummy/spade_9.png", "rummy/back_blue.png"],
    ["rummy/spade_10.png", "rummy/back_blue.png"],
    ["rummy/spade_jack.png", "rummy/back_blue.png"],
    ["rummy/spade_queen.png", "rummy/back_blue.png"],
    ["rummy/spade_king.png", "rummy/back_blue.png"],
    ["rummy/joker_red.png", "rummy/back_blue.png"],
    ["rummy/joker_red.png", "rummy/back_blue.png"],
    ["rummy/joker_red.png", "rummy/back_blue.png"],
  ];

  scene["decks"]["rummy1"] = {
    tick: 0,
    owner: null,
    x: 830,
    y: 270,
    z: 0,
    l: 2,
    w: 30,
    h: 150,
    strides: [2, 20],
    current: 0,
  };

  for (let i = 0; i < images.length; i++) {
    scene["cards"]["card" + (i + 1)] = {
      tick: 1,
      owner: null,
      x: i,
      y: 0,
      w: 100,
      h: 150,
      z: 0,
      l: 2,
      colors: ["", ""],
      images: images[i],
      current: 0,
      onDeck: "rummy1",
    };
  }
}

function generateWriteable(scene) {
  scene["notepads"]["notepad1"] = {
    tick: 1,
    owner: null,
    x: 1100,
    y: 200,
    z: 0,
    l: 0,
    w: 230,
    h: 250,
    text: "You can collaboratively write here.",
  };
}

function generateDog6() {
  let scene = {
    tick: 1,
    boardId: "Dog6",
    gameId: "LIDLn6",
    playerId: "",
    clientId: "",
    avatars: {},
    boards: {},
    marbles: {},
    notepads: {},
    privateAreas: {},
    decks: {},
    cards: {},
  };

  scene["boards"]["board1"] = {
    tick: 1,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    l: 0,
    w: 770,
    h: 770,
    image: "boards/dog.jpeg",
  };

  scene["privateAreas"]["privatearea1"] = {
    tick: 1,
    owner: null,
    x: 830,
    y: 470,
    z: 0,
    l: 1,
    w: 500,
    h: 300,
  };

  const marbles = [
    [418, 62, "Dodgerblue"],
    [387, 56, "Dodgerblue"],
    [358, 56, "Dodgerblue"],
    [326, 56, "Dodgerblue"],
    [609, 170, "Forestgreen"],
    [625, 195, "Forestgreen"],
    [642, 219, "Forestgreen"],
    [654, 247, "Forestgreen"],
    [660, 473, "Dimgray"],
    [645, 503, "Dimgray"],
    [633, 532, "Dimgray"],
    [615, 555, "Dimgray"],
    [425, 676, "Gold"],
    [394, 680, "Gold"],
    [360, 680, "Gold"],
    [332, 681, "Gold"],
    [127, 566, "Crimson"],
    [109, 540, "Crimson"],
    [93, 512, "Crimson"],
    [79, 484, "Crimson"],
    [79, 254, "Snow"],
    [95, 221, "Snow"],
    [108, 194, "Snow"],
    [126, 172, "Snow"],
  ];

  generateAvatars(scene, 6);
  generateMarbles(scene, marbles);
  generateRummy(scene);
  generateWriteable(scene);

  return scene;
}

function generateDog8() {
  let scene = {
    tick: 1,
    boardId: "Dog8",
    gameId: "LIDLn8",
    playerId: "",
    clientId: "",
    avatars: {},
    boards: {},
    marbles: {},
    notepads: {},
    privateAreas: {},
    decks: {},
    cards: {},
  };

  scene["boards"]["board1"] = {
    tick: 1,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    l: 0,
    w: 770,
    h: 770,
    image: "boards/dog8.png",
  };

  scene["privateAreas"]["privatearea1"] = {
    tick: 1,
    owner: null,
    x: 830,
    y: 470,
    z: 0,
    l: 1,
    w: 500,
    h: 300,
  };

  const marbles = [
    [701, 200, "Mediumorchid"],
    [726, 482, "Dodgerblue"],
    [715, 515, "Dodgerblue"],
    [700, 548, "Dodgerblue"],
    [715, 234, "Mediumorchid"],
    [545, 700, "Forestgreen"],
    [512, 714, "Forestgreen"],
    [480, 729, "Forestgreen"],
    [484, 20, "Dimgray"],
    [551, 46, "Dimgray"],
    [730, 265, "Mediumorchid"],
    [517, 33, "Dimgray"],
    [262, 725, "Orange"],
    [47, 196, "Gold"],
    [33, 228, "Gold"],
    [19, 262, "Gold"],
    [231, 713, "Orange"],
    [266, 19, "Crimson"],
    [200, 45, "Crimson"],
    [234, 32, "Crimson"],
    [17, 480, "Darkturquoise"],
    [32, 513, "Darkturquoise"],
    [46, 544, "Darkturquoise"],
    [198, 699, "Orange"],
  ];

  generateAvatars(scene, 8);
  generateMarbles(scene, marbles);
  generateRummy(scene);
  generateWriteable(scene);

  return scene;
}

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

function assembleBoard(boardId) {
  if (boardId === "Dog6") {
    return generateDog6();
  } else if (boardId === "Dog8") {
    return generateDog8();
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

  const board = assembleBoard(game.boardId);
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
    const board = assembleBoard(boardId);

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

  // Step tick forward is client is ahead of us. Client may have
  // a newer state if the server failed and dis-connected during
  // a game. Never regress tick of clients. Server tick and client
  // tick behave like a Lamport timestamp.

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
      if (
        !remote[klass].hasOwnProperty(key) ||
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
