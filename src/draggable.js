"use strict";
function draggablesSynchronize(local, remote) {
    local.draggables = unionLastWriterWins(local.draggables, remote.draggables);
}
function draggablesCompute(local) {
    //
}
function draggablesRender(local) {
    //
}
function draggablesClick(local, itemId) {
    if (local.draggables.hasOwnProperty(itemId)) {
        //
    }
}
function draggablesKeyUp(local, itemId) {
    if (local.draggables.hasOwnProperty(itemId)) {
        //
    }
}
function draggablesTake(local, itemId) {
    if (local.topZ !== null && local.locatables.hasOwnProperty(itemId)) {
        local.locatables[itemId].tick = local.tick + 1;
        local.locatables[itemId].ownedBy = local.playerId;
        local.locatables[itemId].z = local.topZ + 1;
    }
}
function draggablesMove(local, itemId, x, y) {
    if (local.locatables.hasOwnProperty(itemId)) {
        local.locatables[itemId].tick = local.tick + 1;
        local.locatables[itemId].ownedBy = local.playerId;
        local.locatables[itemId].x = x;
        local.locatables[itemId].y = y;
    }
}
function draggablesPlace(local, itemId, wasOutside) {
    //
}
