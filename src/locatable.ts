interface LocatableItem extends Synchronized {
  x: number;
  y: number;
  z: number;
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
      w: loc.w,
      h: loc.h,
    };
  }
}

function locatablesCompute2(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed");
  }

  computed.overlaps = {};

  for (const [cardId, card] of Object.entries(computed.locations)) {
    computed.overlaps[cardId] = {};
    for (const [otherId, other] of Object.entries(computed.locations)) {
      if (otherId === cardId) {
        continue;
      }
      const h =
        Math.min(card.x + card.w, other.x + other.w) -
        Math.max(card.x, other.x);
      const v =
        Math.min(card.y + card.w, other.y + other.h) -
        Math.max(card.y, other.y);

      computed.overlaps[cardId][otherId] = Math.max(0, h) * Math.max(0, v);
    }
  }

  computed.topZ = 0;

  for (const [_, item] of Object.entries(local.locatables)) {
    if (item.z > computed.topZ) {
      computed.topZ = item.z;
    }
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
