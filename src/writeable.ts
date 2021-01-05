interface WriteableItem extends Synchronized {
  text: string;
}

function writeablesSynchronize(local: LocalGame, remote: RemoteGame) {
  local.writeables = unionLastWriterWins(local.writeables, remote.writeables);
}

function writeablesCompute(local: LocalGame) {
  //
}

function writeablesRender(local: LocalGame) {
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
      local.writeables[key].ownedBy === local.playerId ||
      local.writeables[key].tick + 5 < local.tick
    ) {
      (elem as any).disabled = false;
    } else {
      (elem as any).disabled = true;
      (elem as any).value = wrt.text;
    }
  }
}

function writeablesKeyUp(local: LocalGame, itemId: string) {
  if (local.writeables.hasOwnProperty(itemId)) {
    let elem = document.getElementById(itemId);
    if (elem !== null) {
      local.writeables[itemId].tick = local.tick + 1;
      local.writeables[itemId].ownedBy = local.playerId;
      local.writeables[itemId].text = (elem as any).value;
    }
  }
}

function writeablesClick(local: LocalGame, itemId: string) {
  if (local.writeables.hasOwnProperty(itemId)) {
    //
  }
}

function writeablesTake(local: LocalGame, itemId: string) {
  if (local.writeables.hasOwnProperty(itemId)) {
    //
  }
}

function writeablesMove(
  local: LocalGame,
  itemId: string,
  x: number,
  y: number
) {
  if (local.writeables.hasOwnProperty(itemId)) {
    //
  }
}

function writeablesPlace(
  local: LocalGame,
  itemId: string,
  wasOutside: boolean
) {
  if (local.writeables.hasOwnProperty(itemId)) {
    //
  }
}
