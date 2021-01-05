"use strict";
function writeablesSynchronize(local, remote) {
    local.writeables = unionLastWriterWins(local.writeables, remote.writeables);
}
function writeablesCompute(local) {
    //
}
function writeablesRender(local) {
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
        if (local.writeables[key].ownedBy === null ||
            local.writeables[key].ownedBy === local.playerId ||
            local.writeables[key].tick + 5 < local.tick) {
            elem.disabled = false;
        }
        else {
            elem.disabled = true;
            elem.value = wrt.text;
        }
    }
}
function writeablesKeyUp(local, itemId) {
    if (local.writeables.hasOwnProperty(itemId)) {
        let elem = document.getElementById(itemId);
        if (elem !== null) {
            local.writeables[itemId].tick = local.tick + 1;
            local.writeables[itemId].ownedBy = local.playerId;
            local.writeables[itemId].text = elem.value;
        }
    }
}
function writeablesClick(local, itemId) {
    if (local.writeables.hasOwnProperty(itemId)) {
        //
    }
}
function writeablesTake(local, itemId) {
    if (local.writeables.hasOwnProperty(itemId)) {
        //
    }
}
function writeablesMove(local, itemId, x, y) {
    if (local.writeables.hasOwnProperty(itemId)) {
        //
    }
}
function writeablesPlace(local, itemId, wasOutside) {
    if (local.writeables.hasOwnProperty(itemId)) {
        //
    }
}
