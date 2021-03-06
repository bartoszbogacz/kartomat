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

  if (!scene.hasOwnProperty("avatars")) {
    scene["avatars"] = {};
  }
  if (!scene.hasOwnProperty("locatables")) {
    scene["locatables"] = {};
  }
  for (let i = 0; i < count; i++) {
    const itemId = "avatar" + (i + 1);
    if (
      scene["avatars"].hasOwnProperty(itemId) ||
      scene["locatables"].hasOwnProperty(itemId)
    ) {
      throw new Error("ItemId already in use.");
    }
    scene["avatars"][itemId] = {
      represents: null,
      text: "Player" + (i + 1),
    };
    scene["locatables"][itemId] = {
      x: xys[i][0],
      y: xys[i][1],
      w: 200,
      h: 30,
      z: 0,
      l: 0,
      cssClass: "",
      images: [""],
      colors: [""],
      current: 0,
    };
  }
}

function generateMarbles(scene, xycs) {
  if (!scene.hasOwnProperty("draggables")) {
    scene["draggables"] = {};
  }
  if (!scene.hasOwnProperty("locatables")) {
    scene["locatables"] = {};
  }

  for (let i = 0; i < xycs.length; i++) {
    const itemId = "marble" + (i + 1);
    if (
      scene["draggables"].hasOwnProperty(itemId) ||
      scene["locatables"].hasOwnProperty(itemId)
    ) {
      throw new Error("ItemId already in use.");
    }

    scene["draggables"][itemId] = {};
    scene["locatables"][itemId] = {
      x: xycs[i][0],
      y: xycs[i][1],
      w: 20,
      h: 20,
      z: 0,
      l: 2,
      cssClass: "Marble",
      images: [""],
      colors: [xycs[i][2]],
      current: 0,
    };
  }
}

function generateRummy(scene) {
  if (!scene.hasOwnProperty("stackings")) {
    scene["stackings"] = {};
  }
  if (!scene.hasOwnProperty("stackables")) {
    scene["stackables"] = {};
  }
  if (!scene.hasOwnProperty("draggables")) {
    scene["draggables"] = {};
  }
  if (!scene.hasOwnProperty("locatables")) {
    scene["locatables"] = {};
  }

  scene["draggables"]["stacking0"] = {};

  scene["stackings"]["stacking0"] = {
    strides: [2, 30],
    current: 0,
  };

  scene["locatables"]["stacking0"] = {
    x: 830,
    y: 270,
    z: 0,
    l: 1,
    w: 30,
    h: 30,
    cssClass: "MoveControl",
    colors: [""],
    images: ["controls/move.png"],
    current: 0,
  };

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

  for (let i = 0; i < images.length; i++) {
    const itemId = "card" + (i + 1);
    if (
      scene["stackables"].hasOwnProperty(itemId) ||
      scene["draggables"].hasOwnProperty(itemId) ||
      scene["locatables"].hasOwnProperty(itemId)
    ) {
      throw new Error("ItemId already in use.");
    }

    scene["stackables"][itemId] = { onStacking: "stacking0" };
    scene["draggables"][itemId] = {};
    scene["locatables"][itemId] = {
      x: i,
      y: 0,
      w: 100,
      h: 150,
      z: 0,
      l: 2,
      cssClass: "Card",
      images: images[i],
      colors: ["", ""],
      current: 0,
    };
  }
}

function generateWriteable(scene) {
  if (!scene.hasOwnProperty("locatables")) {
    scene["locatables"] = {};
  }
  if (!scene.hasOwnProperty("writeables")) {
    scene["writeables"] = {};
  }

  scene["locatables"]["textarea1"] = {
    x: 1100,
    y: 200,
    z: 0,
    l: 0,
    w: 230,
    h: 250,
    cssClass: "",
    images: [""],
    colors: [""],
    current: 0,
  };

  scene["writeables"]["textarea1"] = {
    text: "You can collaboratively write here.",
  };
}

function generateDog6() {
  let scene = {
    locatables: {
      board: {
        x: 0,
        y: 0,
        z: 0,
        l: 0,
        w: 770,
        h: 770,
        cssClass: "Board",
        images: ["boards/dog.jpeg"],
        colors: [""],
        current: 0,
      },
      privateArea: {
        x: 830,
        y: 470,
        z: 0,
        l: 1,
        w: 500,
        h: 300,
        cssClass: "PrivateArea",
        colors: [""],
        images: [""],
        current: 0,
      },
    },
    dividers: {
      privateArea: {},
    },
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
    locatables: {
      board: {
        x: 0,
        y: 0,
        z: 0,
        l: 0,
        w: 770,
        h: 770,
        cssClass: "Board",
        images: ["boards/dog8.png"],
        colors: [""],
        current: 0,
      },
      privateArea: {
        x: 830,
        y: 470,
        z: 0,
        l: 1,
        w: 500,
        h: 300,
        cssClass: "PrivateArea",
        colors: [""],
        images: [""],
        current: 0,
      },
    },
    dividers: {
      privateArea: {},
    },
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

function hydrateScene(scene) {
  for (const component of Object.keys(scene)) {
    for (const [key, value] of Object.entries(scene[component])) {
      value["tick"] = 0;
      value["ownedBy"] = null;
    }
  }
  return scene;
}

// The method assembleBoard will be called by handleHTTPRequest with boardId
// set by the ?board=Dog query parameter.

function assembleBoard(boardId) {
  if (boardId === "Dog6") {
    return hydrateScene(generateDog6());
  } else if (boardId === "Dog8") {
    return hydrateScene(generateDog8());
  } else {
    throw new Error("Board not implemented");
  }
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
    _runningGames[gameId].sockets[playerId] = [socket];
    console.log(playerId, "joined", gameId, "playing", boardId);
  } else if (_runningGames[gameId].sockets[playerId].indexOf(socket) === -1) {
    _runningGames[gameId].sockets[playerId].push(socket);
    console.log("views", playerId, "in", gameId, "playing", boardId);
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
    for (const [playerId, clientSockets] of Object.entries(game.sockets)) {
      const msg = {
        boardId: game.boardId,
        gameId: gameId,
        playerId: playerId,
        tick: game.tick,
        scene: game.scene,
      };
      for (const cs of clientSockets) {
        cs.send(JSON.stringify(msg));
      }
    }
  }
}

function handleClientDisconnected(socket) {
  for (const [gid, game] of Object.entries(_runningGames)) {
    for (const [pid, sockets] of Object.entries(game.sockets)) {
      const i = sockets.indexOf(socket);
      if (i !== -1) {
        _runningGames[gid].sockets[pid].splice(i, 1);
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
