"use strict";
const _remoteGame = {
    tick: 0,
    playerId: "player1",
    locatables: {
        card1: { tick: 0, ownedBy: null, x: 0, y: 0, z: 0, w: 100, h: 150 },
        card2: { tick: 0, ownedBy: null, x: 110, y: 0, z: 0, w: 100, h: 150 },
        card3: { tick: 0, ownedBy: null, x: 220, y: 0, z: 0, w: 100, h: 150 },
        card4: { tick: 0, ownedBy: null, x: 330, y: 0, z: 0, w: 100, h: 150 },
        write1: { tick: 0, ownedBy: null, x: 10, y: 500, z: 0, w: 300, h: 300 },
        strat1: { tick: 0, ownedBy: null, x: 400, y: 500, z: 0, w: 300, h: 300 },
        strat2: { tick: 0, ownedBy: null, x: 0, y: 1000, z: 1, w: 300, h: 300 },
    },
    draggables: {
        card1: { tick: 0, ownedBy: null },
        card2: { tick: 0, ownedBy: null },
        card3: { tick: 0, ownedBy: null },
        card4: { tick: 0, ownedBy: null },
    },
    stackings: {},
    stackables: {
        card1: { tick: 0, ownedBy: null, onStacking: null },
        card2: { tick: 0, ownedBy: null, onStacking: null },
        card3: { tick: 0, ownedBy: null, onStacking: null },
        card4: { tick: 0, ownedBy: null, onStacking: null },
    },
    turnables: {
        card1: {
            tick: 0,
            ownedBy: null,
            sides: ["rummy/club_1.png", "rummy/back_blue.png"],
            current: 0,
        },
        card2: {
            tick: 0,
            ownedBy: null,
            sides: ["rummy/club_2.png", "rummy/back_blue.png"],
            current: 0,
        },
        card3: {
            tick: 0,
            ownedBy: null,
            sides: ["rummy/club_3.png", "rummy/back_blue.png"],
            current: 0,
        },
        card4: {
            tick: 0,
            ownedBy: null,
            sides: [
                "rummy/club_4.png",
                "rummy/back_blue.png",
                "dices/dice6_side1.png",
            ],
            current: 0,
        },
    },
    writeables: {
        write1: {
            tick: 0,
            ownedBy: null,
            text: "",
        },
    },
    stratifiers: {
        strat1: {
            tick: 0,
            ownedBy: null,
            splitByPlayer: true,
            group: ["card1", "card2"],
        },
        strat2: {
            tick: 0,
            ownedBy: null,
            splitByPlayer: true,
            group: ["card3", "card4"],
        },
    },
};
let _localGame = {
    tick: 0,
    playerId: "player1",
    topZ: null,
    overlaps: null,
    stacks: null,
    locatables: _remoteGame.locatables,
    draggables: _remoteGame.draggables,
    stackings: _remoteGame.stackings,
    stackables: _remoteGame.stackables,
    turnables: _remoteGame.turnables,
    writeables: _remoteGame.writeables,
    stratifiers: _remoteGame.stratifiers,
};
let _drag = null;
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
function render() {
    locatablesSynchronize(_localGame, _remoteGame);
    draggablesSynchronize(_localGame, _remoteGame);
    stackingsSynchronize(_localGame, _remoteGame);
    stackablesSynchronize(_localGame, _remoteGame);
    turnablesSynchronize(_localGame, _remoteGame);
    writeablesSynchronize(_localGame, _remoteGame);
    stratifiersSynchronize(_localGame, _remoteGame);
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
document.body.onmousemove = onMouseMove;
document.body.onmouseup = onMouseUp;
window.setInterval(render, 1000);
// Debug
let locatablesDebug = document.createElement("pre");
locatablesDebug.style.position = "absolute";
locatablesDebug.style.left = "400px";
locatablesDebug.style.userSelect = "none";
document.body.appendChild(locatablesDebug);
