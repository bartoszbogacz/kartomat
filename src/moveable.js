"use strict";
function moveablesSynchronize(local, remote) {
    local.moveables = unionLastWriterWins(local.moveables, remote.moveables);
}
function moveablesCompute(local) {
    local.overlaps = {};
    for (const [cardId, card] of Object.entries(local.moveables)) {
        local.overlaps[cardId] = {};
        for (const [otherId, other] of Object.entries(local.moveables)) {
            if (otherId === cardId) {
                continue;
            }
            const h = Math.min(card.x + card.w, other.x + other.w) -
                Math.max(card.x, other.x);
            const v = Math.min(card.y + card.w, other.y + other.h) -
                Math.max(card.y, other.y);
            local.overlaps[cardId][otherId] = Math.max(0, h) * Math.max(0, v);
        }
    }
    local.topZ = 0;
    for (const [_, item] of Object.entries(local.moveables)) {
        if (item.z > local.topZ) {
            local.topZ = item.z;
        }
    }
}
function moveablesRender(local) {
    for (const [movableId, moveable] of Object.entries(local.moveables)) {
        let elem = document.getElementById(movableId + "Moveable");
        if (elem === null) {
            elem = document.createElement("div");
            elem.id = movableId + "Moveable";
            elem.className = "Moveable";
            elem.style.position = "absolute";
            elem.style.userSelect = "none";
            document.body.appendChild(elem);
        }
        elem.style.top = moveable.y + moveable.h + "px";
        elem.style.left = moveable.x + moveable.w + "px";
        elem.style.zIndex = (moveable.z + 1).toString();
        if (moveable.tick + 5 < local.tick || moveable.ownedBy === null) {
            elem.style.visibility = "hidden";
        }
        else {
            elem.style.visibility = "visible";
            elem.innerHTML = moveable.ownedBy;
        }
    }
}
function moveablesTake(local, itemId) {
    if (local.topZ !== null && local.moveables.hasOwnProperty(itemId)) {
        local.moveables[itemId].tick = local.tick + 1;
        local.moveables[itemId].ownedBy = local.playerId;
        local.moveables[itemId].z = local.topZ + 1;
    }
}
function moveablesMove(local, itemId, x, y) {
    if (local.moveables.hasOwnProperty(itemId)) {
        local.moveables[itemId].tick = local.tick + 1;
        local.moveables[itemId].ownedBy = local.playerId;
        local.moveables[itemId].x = x;
        local.moveables[itemId].y = y;
    }
}
function moveablesPlace(local, itemId, wasOutside) {
    //
}
