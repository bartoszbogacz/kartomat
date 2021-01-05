interface RemoteGame {
  tick: number;
  playerId: string;
  locatables: { [key: string]: LocatableItem };
  draggables: { [key: string]: DraggableItem };
  stackables: { [key: string]: StackableItem };
  stackings: { [key: string]: StackingItem };
  turnables: { [key: string]: TurnableItem };
}

interface LocalGame {
  tick: number;
  playerId: string;
  topZ: number | null;
  overlaps: { [a: string]: { [b: string]: number } } | null;
  stacks: { [key: string]: [string] } | null;
  locatables: { [key: string]: LocatableItem };
  draggables: { [key: string]: DraggableItem };
  stackables: { [key: string]: StackableItem };
  stackings: { [key: string]: StackingItem };
  turnables: { [key: string]: TurnableItem };
}

interface Drag {
  target: HTMLElement;
  y: number;
  x: number;
  startY: number;
  startX: number;
  wasOutside: boolean;
}

const _remoteGame: RemoteGame = {
  tick: 0,
  playerId: "player1",
  locatables: {
    card1: { tick: 0, ownedBy: null, x: 0, y: 0, z: 0, w: 100, h: 150 },
    card2: { tick: 0, ownedBy: null, x: 110, y: 0, z: 0, w: 100, h: 150 },
    card3: { tick: 0, ownedBy: null, x: 220, y: 0, z: 0, w: 100, h: 150 },
    card4: { tick: 0, ownedBy: null, x: 330, y: 0, z: 0, w: 100, h: 150 },
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
};

let _drag: Drag | null = null;

function onClick(event: MouseEvent) {
  if (event.target === null) {
    return;
  }

  const thingId = (event.target as HTMLElement).id;

  stackingClick(_localGame, thingId);

  window.requestAnimationFrame(render);
}

function onMouseDown(event: MouseEvent | TouchEvent) {
  if (event.target === null) {
    return;
  }

  const touch = event.type === "touchmove";
  const clientY = touch
    ? (event as TouchEvent).touches[0].clientY
    : (event as MouseEvent).clientY;
  const clientX = touch
    ? (event as TouchEvent).touches[0].clientX
    : (event as MouseEvent).clientX;

  _drag = {
    target: event.target as HTMLElement,
    y: (event.target as HTMLElement).offsetTop,
    x: (event.target as HTMLElement).offsetLeft,
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

    window.requestAnimationFrame(render);
  }
}

function onMouseMove(event: MouseEvent | TouchEvent) {
  if (event.target === null) {
    return;
  }

  const touch = event.type === "touchmove";
  const clientY = touch
    ? (event as TouchEvent).touches[0].clientY
    : (event as MouseEvent).clientY;
  const clientX = touch
    ? (event as TouchEvent).touches[0].clientX
    : (event as MouseEvent).clientX;

  if (_drag === null) {
    return;
  }

  const y = _drag.y - _drag.startY + clientY;
  const x = _drag.x - _drag.startX + clientX;
  const isOutside =
    Math.abs(_drag.startY - clientY) + Math.abs(_drag.startX - clientX) > 50;

  _drag.wasOutside = _drag.wasOutside || isOutside;

  const thingId = _drag.target.id;

  if (_localGame !== null) {
    locatablesMove(_localGame, thingId, x, y);
    draggablesMove(_localGame, thingId, x, y);
    stackingsMove(_localGame, thingId, x, y);
    stackablesMove(_localGame, thingId, x, y);
    turnablesMove(_localGame, thingId, x, y);

    window.requestAnimationFrame(render);
  }
}

function onMouseUp(event: MouseEvent | TouchEvent) {
  if (event.target === null) {
    return;
  }

  if (_drag === null) {
    return;
  }

  const touch = event.type === "touchmove";
  const clientY = touch
    ? (event as TouchEvent).touches[0].clientY
    : (event as MouseEvent).clientY;
  const clientX = touch
    ? (event as TouchEvent).touches[0].clientX
    : (event as MouseEvent).clientX;

  const y = _drag.y - _drag.startY + clientY;
  const x = _drag.x - _drag.startX + clientX;

  const isOutside =
    Math.abs(_drag.startY - clientY) + Math.abs(_drag.startX - clientX) > 50;

  _drag.wasOutside = _drag.wasOutside || isOutside;

  const thingId = _drag.target.id;

  if (_drag != null && _localGame !== null) {
    locatablesMove(_localGame, thingId, x, y);
    draggablesMove(_localGame, thingId, x, y);
    stackingsMove(_localGame, thingId, x, y);
    stackablesMove(_localGame, thingId, x, y);
    turnablesMove(_localGame, thingId, x, y);

    locatablesPlace(_localGame, thingId, _drag.wasOutside);
    draggablesPlace(_localGame, thingId, _drag.wasOutside);
    stackingsPlace(_localGame, thingId, _drag.wasOutside);
    stackablesPlace(_localGame, thingId, _drag.wasOutside);
    turnablesPlace(_localGame, thingId, _drag.wasOutside);

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

  locatablesCompute(_localGame);
  draggablesCompute(_localGame);
  stackingsCompute(_localGame);
  stackablesCompute(_localGame);
  turnablesCompute(_localGame);

  locatablesRender(_localGame);
  draggablesRender(_localGame);
  stackingsRender(_localGame);
  stackablesRender(_localGame);
  turnablesRender(_localGame);

  debugElem.innerHTML = JSON.stringify(_localGame, null, 2);
}

document.body.onmousemove = onMouseMove;
document.body.onmouseup = onMouseUp;
window.setInterval(render, 1000);

// Debug
let debugElem = document.createElement("pre");
debugElem.style.position = "absolute";
debugElem.style.left = 1000 + "px";
debugElem.style.userSelect = "none";
document.body.appendChild(debugElem);
