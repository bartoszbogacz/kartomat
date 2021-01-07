interface WriteableItem extends Synchronized {
  text: string;
}

function writeablesRender(local: GameState, computed: ComputedState) {
  for (const key of Object.keys(local.writeables)) {
    const wrt = local.writeables[key];
    const loc = local.locatables[key];

    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("textarea");
      elem.onkeyup = onKeyUp;
      elem.id = key;
      (elem as any).value = wrt.text;
      elem.className = "Writeable";
      elem.style.position = "absolute";
      elem.style.resize = "none";
      elem.style.outline = "none";
      elem.style.backgroundColor = "#eeeae2";
      elem.style.color = "#586e75";
      elem.style.fontFamily = "monospace";
      elem.style.border = "2px solid #93a1a1";
      document.body.appendChild(elem);
    }

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
      local.writeables[itemId].tick = computed.tick;
      local.writeables[itemId].ownedBy = computed.playerId;
      local.writeables[itemId].text = (elem as any).value;
    }
  }
}
