interface LocatableItem extends Synchronized {
  x: number;
  y: number;
  z: number;
  l: number;
  w: number;
  h: number;
}

function locatablesCompute1(local: GameState, computed: ComputedState) {
  computed.locations = {};

  for (const [locId, loc] of Object.entries(local.locatables)) {
    computed.locations[locId] = {
      tick: loc.tick,
      ownedBy: loc.ownedBy,
      x: loc.x,
      y: loc.y,
      z: loc.z,
      l: loc.l,
      w: loc.w,
      h: loc.h,
    };
  }
}

function locatablesRender(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  for (const [itemId, loc] of Object.entries(computed.locations)) {
    let elem = document.getElementById(itemId + "Locatable");
    if (elem === null) {
      elem = document.createElement("div");
      elem.id = itemId + "Locatable";
      elem.className = "Locatable";
      elem.style.position = "absolute";
      elem.style.userSelect = "none";
      document.body.appendChild(elem);
    }

    elem.style.top = loc.y + loc.h + "px";
    elem.style.left = loc.x + loc.w + "px";
    elem.style.zIndex = (loc.z + 1).toString();
    if (loc.tick + 5 < computed.tick || loc.ownedBy === null) {
      elem.style.visibility = "hidden";
    } else {
      elem.style.visibility = "visible";
      elem.innerHTML = loc.ownedBy;
    }
  }
}

function overlapMuch(a: LocatableItem, b: LocatableItem) {
  const h = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const v = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return Math.max(0, h) * Math.max(0, v);
}

function locatablesTopZ(locs: { [key: string]: LocatableItem }): number {
  let z: number = 0;
  for (const [_, item] of Object.entries(locs)) {
    if (top === null || item.z > z) {
      z = item.z;
    }
  }
  return z;
}

function locatablesRenderEditControls(
  local: GameState,
  computed: ComputedState,
  doEdit: boolean
) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  for (const [itemId, loc] of Object.entries(computed.locations)) {
    let editMove = document.getElementById(itemId + "LocatableEditMove");
    if (editMove === null) {
      editMove = document.createElement("div");
      editMove.onmousedown = dragAndDrop(
        locatablesMoveControlTake,
        locatablesMoveControlMove,
        locatablesMoveControlPlace,
        itemId
      );
      editMove.id = itemId + "LocatableEditMove";
      editMove.className = "LocatableEditMove";
      editMove.style.position = "absolute";
      editMove.style.userSelect = "none";
      editMove.style.visibility = "hidden";
      editMove.style.width = "10px";
      editMove.style.height = "10px";
      editMove.style.backgroundColor = "yellow";
      editMove.style.border = "2px solid black";
      editMove.style.borderStyle = "none solid solid none";
      document.body.appendChild(editMove);
    }

    let editSize = document.getElementById(itemId + "LocatableEditSize");
    if (editSize === null) {
      editSize = document.createElement("div");
      editSize.onmousedown = dragAndDrop(
        locatablesSizeControlTake,
        locatablesSizeControlMove,
        locatablesSizeControlPlace,
        itemId
      );

      editSize.id = itemId + "LocatableEditSize";
      editSize.className = "LocatableEditSize";
      editSize.style.position = "absolute";
      editSize.style.userSelect = "none";
      editSize.style.visibility = "hidden";
      editSize.style.width = "10px";
      editSize.style.height = "10px";
      editSize.style.backgroundColor = "yellow";
      editSize.style.border = "2px solid black";
      editSize.style.borderStyle = "solid none none solid";
      document.body.appendChild(editSize);
    }

    if (doEdit === true && local.stackables.hasOwnProperty(itemId) === false) {
      editMove.style.left = loc.x - 10 + "px";
      editMove.style.top = loc.y - 10 + "px";
      editMove.style.zIndex = (loc.z + 1).toString();
      editMove.style.visibility = "visible";
    } else {
      editMove.style.visibility = "hidden";
    }

    if (doEdit === true && local.stackables.hasOwnProperty(itemId) === false) {
      editSize.style.left = loc.x + loc.w + "px";
      editSize.style.top = loc.y + loc.h + "px";
      editSize.style.zIndex = (loc.z + 1).toString();
      editSize.style.visibility = "visible";
    } else {
      editSize.style.visibility = "hidden";
    }
  }
}

function locatablesMoveControlTake(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  local.locatables[itemId].tick = computed.tick;
  local.locatables[itemId].ownedBy = computed.playerId;
  local.locatables[itemId].z = locatablesTopZ(local.locatables);
}

function locatablesMoveControlMove(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  x: number,
  y: number
) {
  local.locatables[itemId].tick = computed.tick;
  local.locatables[itemId].ownedBy = computed.playerId;
  local.locatables[itemId].x = x;
  local.locatables[itemId].y = y;
}

function locatablesMoveControlPlace(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  wasOutside: boolean
) {
  //
}

function locatablesSizeControlTake(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  local.locatables[itemId].tick = computed.tick;
  local.locatables[itemId].ownedBy = computed.playerId;
  local.locatables[itemId].z = locatablesTopZ(local.locatables);
}

function locatablesSizeControlMove(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  x: number,
  y: number
) {
  local.locatables[itemId].tick = computed.tick;
  local.locatables[itemId].ownedBy = computed.playerId;
  local.locatables[itemId].w = x - local.locatables[itemId].x;
  local.locatables[itemId].h = y - local.locatables[itemId].y;
}

function locatablesSizeControlPlace(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  wasOutside: boolean
) {
  //
}
