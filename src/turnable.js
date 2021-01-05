"use strict";
function turnablesSynchronize(local, remote) {
    local.turnables = unionLastWriterWins(local.turnables, remote.turnables);
}
function turnablesCompute(local) {
    //
}
function turnablesRender(local) {
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
function turnablesTake(local, itemId) {
    if (local.turnables.hasOwnProperty(itemId)) {
        //
    }
}
function turnablesMove(local, itemId, x, y) {
    if (local.turnables.hasOwnProperty(itemId)) {
        //
    }
}
function turnablesPlace(local, itemId, wasOutside) {
    if (wasOutside === false) {
        turnablesTurn(local, itemId);
    }
}
function turnablesTurn(local, itemId) {
    if (local.turnables.hasOwnProperty(itemId)) {
        local.turnables[itemId].current =
            (local.turnables[itemId].current + 1) %
                local.turnables[itemId].sides.length;
    }
}
