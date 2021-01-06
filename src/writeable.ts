interface WriteableItem extends Synchronized {
  text: string;
}

function writeablesRender(local: GameState, computed: ComputedState) {
  for (const key of Object.keys(local.writeables)) {
    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("textarea");
      elem.onkeyup = onKeyUp;
      elem.id = key;
      elem.className = "Writeable";
      elem.style.position = "absolute";
      elem.style.resize = "none";
      elem.style.outline = "none";
      document.body.appendChild(elem);
    }

    const wrt = local.writeables[key];
    const loc = local.locatables[key];

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.zIndex = loc.z.toString();
    if (
      local.writeables[key].ownedBy === null ||
      local.writeables[key].ownedBy === computed.playerId ||
      local.writeables[key].tick + 5 < computed.tick
    ) {
      (elem as any).disabled = false;
    } else {
      (elem as any).disabled = true;
      (elem as any).value = wrt.text;
    }
  }
}

function writeablesKeyUp(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (local.writeables.hasOwnProperty(itemId)) {
    let elem = document.getElementById(itemId);
    if (elem !== null) {
      local.writeables[itemId].tick = computed.tick + 1;
      local.writeables[itemId].ownedBy = computed.playerId;
      local.writeables[itemId].text = (elem as any).value;
    }
  }
}
