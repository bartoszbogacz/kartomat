interface RemoteGame {
  tick: number;
  playerId: string;
  stackables: { [key: string]: StackableItem };
  moveables: { [key: string]: MoveableItem };
  stackings: { [key: string]: StackingItem };
  turnables: { [key: string]: TurnableItem };
}

interface LocalGame {
  tick: number;
  playerId: string;
  topZ: number | null;
  overlaps: { [a: string]: { [b: string]: number } } | null;
  stacks: { [key: string]: [string] } | null;
  stackables: { [key: string]: StackableItem };
  moveables: { [key: string]: MoveableItem };
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
  moveables: {
    card1: { tick: 0, ownedBy: null, x: 0, y: 0, z: 0, w: 100, h: 150 },
    card2: { tick: 0, ownedBy: null, x: 200, y: 0, z: 0, w: 100, h: 150 },
  },
  stackings: {},
  stackables: {
    card1: { tick: 0, ownedBy: null, onStacking: null, atIndex: 0 },
    card2: { tick: 0, ownedBy: null, onStacking: null, atIndex: 0 },
  },
  turnables: {
    card1: { tick: 0, ownedBy: null, sides: ["null.png"], current: 0 },
    card2: { tick: 0, ownedBy: null, sides: ["null.png"], current: 0 },
  },
};

let _localGame = {
  tick: 0,
  playerId: "player1",
  topZ: null,
  overlaps: null,
  stacks: null,
  moveables: _remoteGame.moveables,
  stackings: _remoteGame.stackings,
  stackables: _remoteGame.stackables,
  turnables: _remoteGame.turnables,
};

let _drag: Drag | null = null;

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
    moveablesTake(_localGame, thingId);
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
    moveablesMove(_localGame, thingId, x, y);
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

  _drag = null;

  if (_localGame !== null) {
    moveablesMove(_localGame, thingId, x, y);
    stackingsMove(_localGame, thingId, x, y);
    stackablesMove(_localGame, thingId, x, y);
    turnablesMove(_localGame, thingId, x, y);

    moveablesPlace(_localGame, thingId);
    stackingsPlace(_localGame, thingId);
    stackablesPlace(_localGame, thingId);
    turnablesPlace(_localGame, thingId);

    window.requestAnimationFrame(render);
  }
}

function render() {
  moveablesSynchronize(_localGame, _remoteGame);
  stackingsSynchronize(_localGame, _remoteGame);
  stackablesSynchronize(_localGame, _remoteGame);
  turnablesSynchronize(_localGame, _remoteGame);

  moveablesCompute(_localGame);
  stackingsCompute(_localGame);
  stackablesCompute(_localGame);
  turnablesCompute(_localGame);

  moveablesRender(_localGame);
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
