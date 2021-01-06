interface Synchronized {
  tick: number;
  ownedBy: string | null;
}

interface GameState {
  locatables: { [key: string]: LocatableItem };
  draggables: { [key: string]: DraggableItem };
  stackables: { [key: string]: StackableItem };
  stackings: { [key: string]: StackingItem };
  turnables: { [key: string]: TurnableItem };
  writeables: { [key: string]: WriteableItem };
  stratified: { [key: string]: StratifiedItem };
  stratifiers: { [key: string]: StratifierItem };
}

interface ComputedState {
  tick: number;
  boardId: string | null;
  gameId: string | null;
  playerId: string | null;
  topZ: number | null;
  overlaps: { [a: string]: { [b: string]: number } } | null;
  stacks: { [key: string]: [string] } | null;
  locations: { [key: string]: LocatableItem } | null;
}

interface Drag {
  target: HTMLElement;
  y: number;
  x: number;
  startY: number;
  startX: number;
  wasOutside: boolean;
}

let _drag: Drag | null = null;
let _websocket: any = null;

let _localGame: GameState = {
  locatables: {},
  draggables: {},
  stackables: {},
  stackings: {},
  turnables: {},
  writeables: {},
  stratified: {},
  stratifiers: {},
};

let _computed: ComputedState = {
  tick: 0,
  boardId: null,
  gameId: null,
  playerId: null,
  topZ: null,
  overlaps: null,
  stacks: null,
  locations: null,
};

function initWebSocketClient() {
  let [path, parameters] = parseUrl(window.location.href);

  _computed.boardId = parameters.board || null;
  _computed.gameId = parameters.game || null;
  _computed.playerId = parameters.player || null;

  _websocket = new WebSocket("ws://" + window.location.hostname + ":8080");

  _websocket.onopen = function (event: any) {
    sendClientMessage();
  };

  _websocket.onmessage = function (msg: string) {
    handleServerMessage(msg);
  };

  _websocket.onerror = function (event: any) {
    window.setTimeout(initWebSocketClient, 2000);
  };

  _websocket.onclose = function (event: any) {
    window.setTimeout(initWebSocketClient, 2000);
  };
}

function sendClientMessage() {
  const msg = {
    boardId: _computed.boardId,
    gameId: _computed.gameId,
    playerId: _computed.playerId,
    scene: _localGame,
  };

  _websocket.send(JSON.stringify(msg));
}

function handleServerMessage(msg: any) {
  msg = JSON.parse(msg.data);

  const remoteGame = msg.scene as GameState;

  _localGame.locatables = unionLastWriterWins(
    _localGame.locatables,
    remoteGame.locatables
  );
  _localGame.draggables = unionLastWriterWins(
    _localGame.draggables,
    remoteGame.draggables
  );
  _localGame.stackings = unionLastWriterWins(
    _localGame.stackings,
    remoteGame.stackings
  );
  _localGame.stackables = unionLastWriterWins(
    _localGame.stackables,
    remoteGame.stackables
  );
  _localGame.turnables = unionLastWriterWins(
    _localGame.turnables,
    remoteGame.turnables
  );
  _localGame.writeables = unionLastWriterWins(
    _localGame.writeables,
    remoteGame.writeables
  );
  _localGame.stratified = unionLastWriterWins(
    _localGame.stratified,
    remoteGame.stratified
  );
  _localGame.stratifiers = unionLastWriterWins(
    _localGame.stratifiers,
    remoteGame.stratifiers
  );

  _computed.tick = msg.tick;
  _computed.boardId = msg.boardId;
  _computed.gameId = msg.gameId;
  _computed.playerId = msg.playerId;

  sendClientMessage();

  window.requestAnimationFrame(render);
}

function render() {
  if (_localGame === null) {
    return;
  }

  // This order is important. It should be
  // loc1, strat, stack, loc2. Computes
  // in-between are fine.
  locatablesCompute1(_localGame, _computed);
  stratifiersCompute(_localGame, _computed);
  stackablesCompute(_localGame, _computed);
  locatablesCompute2(_localGame, _computed);

  locatablesRender(_localGame, _computed);
  stackingsRender(_localGame, _computed);
  turnablesRender(_localGame, _computed);
  writeablesRender(_localGame, _computed);
  stratifierRender(_localGame, _computed);

  // Debug
  const diffToTick: { [key: string]: any } = {};
  for (const [locId, locatable] of Object.entries(_localGame.locatables)) {
    if (locatable.tick + 50 > _computed.tick) {
      diffToTick[locId] = locatable;
    }
  }

  debug.innerHTML = JSON.stringify(diffToTick, null, 2);
}

function onClick(event: MouseEvent) {
  if (_localGame === null || event.target === null) {
    return;
  }

  const thingId = (event.target as HTMLElement).id;

  stackingsTouch(_localGame, _computed, thingId);

  window.requestAnimationFrame(render);
}

function onKeyUp(event: KeyboardEvent) {
  if (_localGame === null || event.target === null) {
    return;
  }

  const thingId = (event.target as HTMLElement).id;

  writeablesKeyUp(_localGame, _computed, thingId);

  window.requestAnimationFrame(render);
}

function onMouseDown(event: MouseEvent | TouchEvent) {
  event.preventDefault();

  if (_localGame === null || event.target === null) {
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

  draggablesTake(_localGame, _computed, thingId);
  stackablesTake(_localGame, _computed, thingId);

  window.requestAnimationFrame(render);
}

function onMouseMove(event: MouseEvent | TouchEvent) {
  event.preventDefault();

  if (_localGame === null || event.target === null) {
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

  draggablesMove(_localGame, _computed, thingId, x, y);

  window.requestAnimationFrame(render);
}

function onMouseUp(event: MouseEvent | TouchEvent) {
  event.preventDefault();

  if (_drag === null || _localGame === null || event.target === null) {
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

  draggablesMove(_localGame, _computed, thingId, x, y);

  stackingsPlace(_localGame, _computed, thingId, _drag.wasOutside);
  stackablesPlace(_localGame, _computed, thingId, _drag.wasOutside);
  turnablesPlace(_localGame, _computed, thingId, _drag.wasOutside);

  _drag = null;

  window.requestAnimationFrame(render);
}

/** Union two LWWMaps returning a copy of the superset.
 *
 * The union is biased towards state2 on equal tick counts of both,
 * by performing the merging of state2 onto result secondary and
 * avoid an explicit lesser equals check there.
 *
 */
function unionLastWriterWins<T extends Synchronized, K extends keyof T>(
  state1: { [key: string]: T },
  state2: { [key: string]: T }
): { [key: string]: T } {
  const result: { [key: string]: T } = {};

  for (const key of Object.keys(state2)) {
    if (state1.hasOwnProperty(key) && state1[key].tick > state2[key].tick) {
      continue;
    }
    result[key] = {} as any;
    for (const [prop, value] of Object.entries(state2[key])) {
      result[key][prop as K] = value;
    }
  }

  for (const key of Object.keys(state1)) {
    if (state2.hasOwnProperty(key) && state2[key].tick > state1[key].tick) {
      continue;
    }
    result[key] = {} as any;
    for (const [prop, value] of Object.entries(state1[key])) {
      result[key][prop as K] = value;
    }
  }

  return result;
}

function parseUrl(url: string): [string, { [key: string]: any }] {
  let path = null;
  let parameters: { [key: string]: any } = {};

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

initWebSocketClient();

document.body.onmousemove = onMouseMove;
document.body.onmouseup = onMouseUp;
window.setInterval(render, 1000);

// Debug
let debug = document.createElement("pre");
debug.style.position = "absolute";
debug.style.left = "400px";
debug.style.userSelect = "none";
document.body.appendChild(debug);
