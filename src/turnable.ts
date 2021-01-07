interface TurnableItem extends Synchronized {
  sides: string[];
  current: number;
}

function turnablesRender(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed");
  }

  // FIXME: This overlaps with visual which also controls
  // positions, extents and visuals.

  for (const key of Object.keys(local.turnables)) {
    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("div");
      elem.onmousedown = onMouseDown;
      elem.id = key;
      elem.className = "Turnable";
      elem.style.position = "absolute";
      elem.style.userSelect = "none";
      document.body.appendChild(elem);
    }

    const trn = local.turnables[key];
    const loc = computed.locations[key];

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.backgroundSize = loc.w + "px " + loc.h + "px";
    elem.style.zIndex = loc.z.toString();
    elem.style.backgroundImage = "url(" + trn.sides[trn.current] + ")";
  }
}

function turnablesPlace(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  wasOutside: boolean
) {
  if (wasOutside === false) {
    turnablesTurn(local, computed, itemId);
  }
}

function turnablesTurn(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (local.turnables.hasOwnProperty(itemId)) {
    local.turnables[itemId].tick = computed.tick;
    local.turnables[itemId].ownedBy = computed.playerId;
    local.turnables[itemId].current =
      (local.turnables[itemId].current + 1) %
      local.turnables[itemId].sides.length;
  }
}
