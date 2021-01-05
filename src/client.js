"use strict";
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
function render() {
    locatablesCompute(_localGame);
    draggablesCompute(_localGame);
    stackingsCompute(_localGame);
    stackablesCompute(_localGame);
    turnablesCompute(_localGame);
    writeablesCompute(_localGame);
    stratifiersCompute(_localGame);
    locatablesRender(_localGame);
    draggablesRender(_localGame);
    stackingsRender(_localGame);
    stackablesRender(_localGame);
    turnablesRender(_localGame);
    writeablesRender(_localGame);
    stratifiersRender(_localGame);
    locatablesDebug.innerHTML = JSON.stringify(_localGame.locatables, null, 2);
}
function onClick(event) {
    if (event.target === null) {
        return;
    }
    const thingId = event.target.id;
    locatablesClick(_localGame, thingId);
    draggablesClick(_localGame, thingId);
    stackingsClick(_localGame, thingId);
    stackablesClick(_localGame, thingId);
    turnablesClick(_localGame, thingId);
    writeablesClick(_localGame, thingId);
    stratifiersClick(_localGame, thingId);
    window.requestAnimationFrame(render);
}
function onKeyUp(event) {
    if (event.target === null) {
        return;
    }
    const thingId = event.target.id;
    locatablesKeyUp(_localGame, thingId);
    draggablesKeyUp(_localGame, thingId);
    stackingsKeyUp(_localGame, thingId);
    stackablesKeyUp(_localGame, thingId);
    turnablesKeyUp(_localGame, thingId);
    writeablesKeyUp(_localGame, thingId);
    stratifiersKeyUp(_localGame, thingId);
    window.requestAnimationFrame(render);
}
function onMouseDown(event) {
    if (event.target === null) {
        return;
    }
    const touch = event.type === "touchmove";
    const clientY = touch
        ? event.touches[0].clientY
        : event.clientY;
    const clientX = touch
        ? event.touches[0].clientX
        : event.clientX;
    _drag = {
        target: event.target,
        y: event.target.offsetTop,
        x: event.target.offsetLeft,
        startY: clientY,
        startX: clientX,
        wasOutside: false,
    };
    const thingId = _drag.target.id;
    if (_localGame !== null) {
        locatablesTake(_localGame, thingId);
        draggablesTake(_localGame, thingId);
        stackingsTake(_localGame, thingId);
        stackablesTake(_localGame, thingId);
        turnablesTake(_localGame, thingId);
        writeablesTake(_localGame, thingId);
        stratifiersTake(_localGame, thingId);
        window.requestAnimationFrame(render);
    }
}
function onMouseMove(event) {
    if (event.target === null) {
        return;
    }
    const touch = event.type === "touchmove";
    const clientY = touch
        ? event.touches[0].clientY
        : event.clientY;
    const clientX = touch
        ? event.touches[0].clientX
        : event.clientX;
    if (_drag === null) {
        return;
    }
    const y = _drag.y - _drag.startY + clientY;
    const x = _drag.x - _drag.startX + clientX;
    const isOutside = Math.abs(_drag.startY - clientY) + Math.abs(_drag.startX - clientX) > 50;
    _drag.wasOutside = _drag.wasOutside || isOutside;
    const thingId = _drag.target.id;
    if (_localGame !== null) {
        locatablesMove(_localGame, thingId, x, y);
        draggablesMove(_localGame, thingId, x, y);
        stackingsMove(_localGame, thingId, x, y);
        stackablesMove(_localGame, thingId, x, y);
        turnablesMove(_localGame, thingId, x, y);
        writeablesMove(_localGame, thingId, x, y);
        stratifiersMove(_localGame, thingId, x, y);
        window.requestAnimationFrame(render);
    }
}
function onMouseUp(event) {
    if (event.target === null) {
        return;
    }
    if (_drag === null) {
        return;
    }
    const touch = event.type === "touchmove";
    const clientY = touch
        ? event.touches[0].clientY
        : event.clientY;
    const clientX = touch
        ? event.touches[0].clientX
        : event.clientX;
    const y = _drag.y - _drag.startY + clientY;
    const x = _drag.x - _drag.startX + clientX;
    const isOutside = Math.abs(_drag.startY - clientY) + Math.abs(_drag.startX - clientX) > 50;
    _drag.wasOutside = _drag.wasOutside || isOutside;
    const thingId = _drag.target.id;
    if (_drag != null && _localGame !== null) {
        locatablesMove(_localGame, thingId, x, y);
        draggablesMove(_localGame, thingId, x, y);
        stackingsMove(_localGame, thingId, x, y);
        stackablesMove(_localGame, thingId, x, y);
        turnablesMove(_localGame, thingId, x, y);
        writeablesMove(_localGame, thingId, x, y);
        stratifiersMove(_localGame, thingId, x, y);
        locatablesPlace(_localGame, thingId, _drag.wasOutside);
        draggablesPlace(_localGame, thingId, _drag.wasOutside);
        stackingsPlace(_localGame, thingId, _drag.wasOutside);
        stackablesPlace(_localGame, thingId, _drag.wasOutside);
        turnablesPlace(_localGame, thingId, _drag.wasOutside);
        writeablesPlace(_localGame, thingId, _drag.wasOutside);
        stratifiersPlace(_localGame, thingId, _drag.wasOutside);
        window.requestAnimationFrame(render);
    }
    _drag = null;
}
function parseUrl(url) {
    let path = null;
    let parameters = {};
    const pathQuery = url.split("?");
    if (pathQuery.length === 1) {
        path = pathQuery[0];
    }
    else {
        path = pathQuery[0];
        const parts = pathQuery[1].split("&");
        for (const p of parts) {
            const keyValue = p.split("=");
            if (keyValue.length === 1) {
                parameters[keyValue[0]] = true;
            }
            else {
                parameters[keyValue[0]] = keyValue[1];
            }
        }
    }
    return [path, parameters];
}
function sendClientMessage() {
    const localGame = {
        locatables: _localGame.locatables,
        draggables: _localGame.draggables,
        stackings: _localGame.stackings,
        stackables: _localGame.stackables,
        turnables: _localGame.turnables,
        writeables: _localGame.writeables,
        stratifiers: _localGame.stratifiers,
    };
    const msg = {
        boardId: _localGame.boardId,
        gameId: _localGame.gameId,
        playerId: _localGame.playerId,
        scene: localGame,
    };
    _websocket.send(JSON.stringify(msg));
}
function handleServerMessage(msg) {
    msg = JSON.parse(msg.data);
    const remoteGame = msg.scene;
    locatablesSynchronize(_localGame, remoteGame);
    draggablesSynchronize(_localGame, remoteGame);
    stackingsSynchronize(_localGame, remoteGame);
    stackablesSynchronize(_localGame, remoteGame);
    turnablesSynchronize(_localGame, remoteGame);
    writeablesSynchronize(_localGame, remoteGame);
    stratifiersSynchronize(_localGame, remoteGame);
    _localGame.tick = msg.tick;
    _localGame.boardId = msg.boardId;
    _localGame.gameId = msg.gameId;
    _localGame.playerId = msg.playerId;
    sendClientMessage();
}
function keepWebsocketConnected() {
    _websocket = new WebSocket("ws://" + window.location.hostname + ":8080");
    _websocket.onopen = function () {
        sendClientMessage();
    };
    _websocket.onmessage = function (msg) {
        handleServerMessage(msg);
    };
    _websocket.onerror = function () {
        window.setTimeout(keepWebsocketConnected, 2000);
    };
    _websocket.onclose = function () {
        window.setTimeout(keepWebsocketConnected, 2000);
    };
}
let [path, parameters] = parseUrl(window.location.href);
let _drag = null;
let _websocket = null;
let _localGame = {
    tick: 0,
    boardId: parameters.board || null,
    gameId: parameters.game || null,
    playerId: parameters.player || null,
    topZ: null,
    overlaps: null,
    stacks: null,
    locatables: {},
    draggables: {},
    stackables: {},
    stackings: {},
    turnables: {},
    writeables: {},
    stratifiers: {},
};
keepWebsocketConnected();
document.body.onmousemove = onMouseMove;
document.body.onmouseup = onMouseUp;
window.setInterval(render, 1000);
// Debug
let locatablesDebug = document.createElement("pre");
locatablesDebug.style.position = "absolute";
locatablesDebug.style.left = "400px";
locatablesDebug.style.userSelect = "none";
document.body.appendChild(locatablesDebug);
