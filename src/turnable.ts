interface TurnableItem extends Synchronized {
  sides: [string];
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

    const m = local.moveables[key];
    const t = local.turnables[key];

    elem.style.top = m.y + "px";
    elem.style.left = m.x + "px";
    elem.style.width = m.w + "px";
    elem.style.height = m.h + "px";
    elem.style.backgroundSize = m.w + "px " + m.h + "px";
    elem.style.zIndex = m.z.toString();
    elem.style.backgroundImage = "url(" + t.sides[t.current] + ")";
  }
}

function turnablesTake(local: LocalGame, itemId: string) {
  //
}

function turnablesMove(local: LocalGame, itemId: string, x: number, y: number) {
  //
}

function turnablesPlace(local: LocalGame, itemId: string) {
  //
}
