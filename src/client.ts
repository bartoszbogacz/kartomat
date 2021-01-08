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
  dividers: { [key: string]: DividerItem };
  avatars: { [key: string]: AvatarItem };
  visuals: { [key: string]: VisualItem };
}

interface ComputedState {
  tick: number;
  boardId: string | null;
  gameId: string | null;
  playerId: string | null;
  stacks: { [key: string]: [string] } | null;
  locations: { [key: string]: LocatableItem } | null;
  playerAvatars: { [key: string]: string } | null;
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

let _remoteGame: GameState = {
  locatables: {},
  draggables: {},
  stackables: {},
  stackings: {},
  turnables: {},
  writeables: {},
  dividers: {},
  avatars: {},
  visuals: {},
};

let _localGame: GameState = {
  locatables: {},
  draggables: {},
  stackables: {},
  stackings: {},
  turnables: {},
  writeables: {},
  dividers: {},
  avatars: {},
  visuals: {},
};

let _computed: ComputedState = {
  tick: 0,
  boardId: null,
  gameId: null,
  playerId: null,
  stacks: null,
  locations: null,
  playerAvatars: null,
};

function initDocumentControls() {
  const elem = document.createElement("div");
  elem.style.position = "absolute";
  elem.style.left = "800px";
  elem.style.top = "30px";
  elem.style.border = "2px solid crimson";
  elem.style.borderRadius = "0.3em";
  elem.style.padding = "0.3em";
  elem.innerHTML = "Reload game";
  elem.onclick = function () {
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("PUT", "/reload?game=" + _computed.gameId, true);
    httpRequest.send();
  };
  document.body.appendChild(elem);

  document.addEventListener("mousemove", onMouseMove, {
    passive: false,
    capture: true,
  });
  document.addEventListener("mouseup", onMouseUp, {
    passive: false,
    capture: true,
  });
  document.addEventListener("touchmove", onMouseMove, {
    passive: false,
    capture: true,
  });
  document.addEventListener("touchend", onMouseUp, {
    passive: false,
    capture: true,
  });
}

function initWebSocketClient() {
  let [path, parameters] = parseUrl(window.location.href);

  _computed.boardId = parameters.board || null;
  _computed.gameId = parameters.game || null;
  _computed.playerId =
    parameters.player || window.localStorage.getItem("playerId");

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
  const changes: { [trait: string]: { [iid: string]: Synchronized } } = {};

  for (const [trait, items] of Object.entries(_localGame)) {
    changes[trait] = {};
    for (const [iid, item] of Object.entries(items)) {
      if (
        (item as Synchronized).tick >
        _remoteGame[trait as keyof GameState][iid].tick
      ) {
        changes[trait][iid] = item as Synchronized;
      }
    }
  }

  const msg = {
    boardId: _computed.boardId,
    gameId: _computed.gameId,
    playerId: _computed.playerId,
    scene: changes,
  };

  _websocket.send(JSON.stringify(msg));
}

function handleServerMessage(msg: any) {
  msg = JSON.parse(msg.data);

  _remoteGame = msg.scene as GameState;

  _localGame.locatables = unionLastWriterWins(
    _localGame.locatables,
    _remoteGame.locatables
  );
  _localGame.draggables = unionLastWriterWins(
    _localGame.draggables,
    _remoteGame.draggables
  );
  _localGame.stackings = unionLastWriterWins(
    _localGame.stackings,
    _remoteGame.stackings
  );
  _localGame.stackables = unionLastWriterWins(
    _localGame.stackables,
    _remoteGame.stackables
  );
  _localGame.turnables = unionLastWriterWins(
    _localGame.turnables,
    _remoteGame.turnables
  );
  _localGame.writeables = unionLastWriterWins(
    _localGame.writeables,
    _remoteGame.writeables
  );
  _localGame.dividers = unionLastWriterWins(
    _localGame.dividers,
    _remoteGame.dividers
  );
  _localGame.avatars = unionLastWriterWins(
    _localGame.avatars,
    _remoteGame.avatars
  );
  _localGame.visuals = unionLastWriterWins(
    _localGame.visuals,
    _remoteGame.visuals
  );

  _computed.tick = msg.tick;
  _computed.boardId = msg.boardId;
  _computed.gameId = msg.gameId;
  _computed.playerId = msg.playerId;

  window.localStorage.setItem("playerId", msg.playerId);

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
  // FIXME: locatablesCompute2 needs to be called twice,
  // since stackingsCreateNew may add new ones on button
  // presses and these need to be available by stratifersCompute
  // and than again, based on the dividers again for button
  // presses
  locatablesCompute1(_localGame, _computed);
  dividersCompute(_localGame, _computed);
  stackablesCompute(_localGame, _computed);
  avatarsCompute(_localGame, _computed);

  locatablesRender(_localGame, _computed);
  stackingsRender(_localGame, _computed);
  turnablesRender(_localGame, _computed);
  writeablesRender(_localGame, _computed);
  avatarsRender(_localGame, _computed);
  visualsRender(_localGame, _computed);
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
  avatarsKeyUp(_localGame, _computed, thingId);

  window.requestAnimationFrame(render);
}

function onMouseDown(event: Event) {
  // Using preventDefault here precludes textareas working on
  // mobile. Since we only want to prevent selection and dragging
  // of elements, preventDefault on mouseMove is enough.

  if (_localGame === null || event.target === null) {
    return;
  }

  const touch = event.type === "touchstart";
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

function onMouseMove(event: Event) {
  event.preventDefault();

  if (_localGame === null) {
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

function onMouseUp(event: Event) {
  if (_drag === null || _localGame === null) {
    return;
  }

  const thingId = _drag.target.id;

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
initDocumentControls();
window.setInterval(render, 1000);
