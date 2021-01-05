"use strict";
function locatablesSynchronize(local, remote) {
    local.locatables = unionLastWriterWins(local.locatables, remote.locatables);
}
function locatablesCompute(local) {
    local.overlaps = {};
    for (const [cardId, card] of Object.entries(local.locatables)) {
        local.overlaps[cardId] = {};
        for (const [otherId, other] of Object.entries(local.locatables)) {
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
    for (const [_, item] of Object.entries(local.locatables)) {
        if (item.z > local.topZ) {
            local.topZ = item.z;
        }
    }
}
function locatablesRender(local) {
    for (const [itemId, locatable] of Object.entries(local.locatables)) {
        let elem = document.getElementById(itemId + "Locatable");
        if (elem === null) {
            elem = document.createElement("div");
            elem.id = itemId + "Locatable";
            elem.className = "Locatable";
            elem.style.position = "absolute";
            elem.style.userSelect = "none";
            document.body.appendChild(elem);
        }
        elem.style.top = locatable.y + locatable.h + "px";
        elem.style.left = locatable.x + locatable.w + "px";
        elem.style.zIndex = (locatable.z + 1).toString();
        if (locatable.tick + 5 < local.tick || locatable.ownedBy === null) {
            elem.style.visibility = "hidden";
        }
        else {
            elem.style.visibility = "visible";
            elem.innerHTML = locatable.ownedBy;
        }
    }
}
function locatablesTake(local, itemId) {
    //
}
function locatablesMove(local, itemId, x, y) {
    //
}
function locatablesPlace(local, itemId, wasOutside) {
    //
}
