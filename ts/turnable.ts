interface Turnable extends Synchronized {
  sides: [string];
  current: number;
}

function turnablesRender(
  movables: { [key: string]: Moveable },
  turnables: { [key: string]: Turnable }
) {
  for (const key of Object.keys(turnables)) {
    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("div");
      elem.className = "Turnable";
      //element.onmousedown = onMouseDown;
      document.body.appendChild(elem);
    }

    const m = movables[key];
    const t = turnables[key];

    elem.style.top = m.y + "px";
    elem.style.left = m.x + "px";
    elem.style.width = m.w + "px";
    elem.style.height = m.h + "px";
    elem.style.zIndex = m.z.toString();
    elem.style.backgroundImage = "url(" + t.sides[t.current] + ")";
  }
}
