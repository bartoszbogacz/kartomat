interface TurnableItem extends Synchronized {
  sides: string[];
  current: number;
}

function turnablesSynchronize(local: LocalGame, remote: RemoteGame) {
  local.turnables = unionLastWriterWins(local.turnables, remote.turnables);
}

function turnablesCompute(local: LocalGame) {
  //
}

function turnablesRender(local: LocalGame) {
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
    const loc = local.locatables[key];

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.backgroundSize = loc.w + "px " + loc.h + "px";
    elem.style.zIndex = loc.z.toString();
    elem.style.backgroundImage = "url(" + trn.sides[trn.current] + ")";
  }
}

function turnablesClick(local: LocalGame, itemId: string) {
  if (local.turnables.hasOwnProperty(itemId)) {
    //
  }
}

function turnablesKeyUp(local: LocalGame, itemId: string) {
  if (local.turnables.hasOwnProperty(itemId)) {
    //
  }
}

function turnablesTake(local: LocalGame, itemId: string) {
  if (local.turnables.hasOwnProperty(itemId)) {
    //
  }
}

function turnablesMove(local: LocalGame, itemId: string, x: number, y: number) {
  if (local.turnables.hasOwnProperty(itemId)) {
    //
  }
}

function turnablesPlace(local: LocalGame, itemId: string, wasOutside: boolean) {
  if (wasOutside === false) {
    turnablesTurn(local, itemId);
  }
}

function turnablesTurn(local: LocalGame, itemId: string) {
  if (local.turnables.hasOwnProperty(itemId)) {
    local.turnables[itemId].current =
      (local.turnables[itemId].current + 1) %
      local.turnables[itemId].sides.length;
  }
}
