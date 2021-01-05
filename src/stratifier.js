"use strict";
function stratifiersSynchronize(local, remote) {
    local.stratifiers = unionLastWriterWins(local.stratifiers, remote.stratifiers);
}
function stratifiersCompute(local) {
    for (const [stratifierId, stratifier] of Object.entries(local.stratifiers)) {
        stratifier.group.sort((a, b) => local.locatables[a].z - local.locatables[b].z);
        if (stratifier.splitByPlayer) {
            let accumZ = Math.min(local.locatables[stratifierId].z, local.locatables[stratifier.group[0]].z);
            for (const itemId of stratifier.group) {
                if (local.locatables[itemId].ownedBy !== local.playerId) {
                    local.locatables[itemId].z = accumZ;
                    accumZ = accumZ + 1;
                }
            }
            local.locatables[stratifierId].z = accumZ;
            accumZ = accumZ + 1;
            for (const itemId of stratifier.group) {
                if (local.locatables[itemId].ownedBy === local.playerId) {
                    local.locatables[itemId].z = accumZ;
                    accumZ = accumZ + 1;
                }
            }
        }
        else {
            let accumZ = local.locatables[stratifierId].z;
            accumZ = accumZ + 1;
            for (const itemId of stratifier.group) {
                local.locatables[itemId].z = accumZ;
                accumZ = accumZ + 1;
            }
        }
    }
}
function stratifiersRender(local) {
    //
}
function stratifiersClick(local, itemId) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
function stratifiersKeyUp(local, itemId) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
function stratifiersTake(local, itemId) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
function stratifiersMove(local, itemId, x, y) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
function stratifiersPlace(local, itemId, wasOutside) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
function stratifiersTurn(local, itemId) {
    if (local.stratifiers.hasOwnProperty(itemId)) {
        //
    }
}
