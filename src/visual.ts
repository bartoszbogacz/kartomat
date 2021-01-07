interface VisualItem extends Synchronized {
  cssClass: string;
}

function visualsRender(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed");
  }

  for (const key of Object.keys(local.visuals)) {
    const vis = local.visuals[key];
    const loc = computed.locations[key];

    // FIXME: This overlaps with turnable, i.e. it also
    // controls the position and and extents of an element.

    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("div");
      elem.onmousedown = onMouseDown;
      elem.id = key;
      elem.className = vis.cssClass;
      elem.style.position = "absolute";
      elem.style.userSelect = "none";
      document.body.appendChild(elem);
    }

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.zIndex = loc.z.toString();
    elem.className = vis.cssClass;
  }
}
