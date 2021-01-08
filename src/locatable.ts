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
  const v = Math.min(a.y + a.w, b.y + b.h) - Math.max(a.y, b.y);
  return Math.max(0, h) * Math.max(0, v);
}

function locatableOnTopZ(locs: { [key: string]: LocatableItem }): number {
  let z: number = 0;
  for (const [_, item] of Object.entries(locs)) {
    if (top === null || item.z > z) {
      z = item.z;
    }
  }
  return z;
}
