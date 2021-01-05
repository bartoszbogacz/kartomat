"use strict";
function stackablesSynchronize(local, remote) {
    local.stackables = unionLastWriterWins(local.stackables, remote.stackables);
}
function stackablesCompute(local) {
    local.stacks = {};
    for (const [key, st] of Object.entries(local.stackables)) {
        if (st.onStacking !== null) {
            if (local.stacks.hasOwnProperty(st.onStacking)) {
                local.stacks[st.onStacking].push(key);
            }
            else {
                local.stacks[st.onStacking] = [key];
            }
        }
    }
    for (const [_, st] of Object.entries(local.stacks)) {
        st.sort((a, b) => local.locatables[a].x - local.locatables[b].x);
    }
    for (const [stackingId, stack] of Object.entries(local.stacks)) {
        const stacking_s = local.stackings[stackingId];
        const stacking_m = local.locatables[stackingId];
        const stride = stacking_s.strides[stacking_s.current];
        for (let i = 0; i < stack.length; i++) {
            local.locatables[stack[i]].x = stacking_m.x + i * stride;
            local.locatables[stack[i]].y = stacking_m.y;
            local.locatables[stack[i]].z = stacking_m.z + i;
        }
    }
}
function stackablesRender(local) {
    //
}
function stackablesClick(local, itemId) {
    if (local.stackables.hasOwnProperty(itemId)) {
        //
    }
}
function stackablesKeyUp(local, itemId) {
    if (local.stackables.hasOwnProperty(itemId)) {
        //
    }
}
function stackablesTake(local, itemId) {
    if (local.stackables.hasOwnProperty(itemId)) {
        local.stackables[itemId].onStacking = null;
    }
}
function stackablesMove(local, itemId, x, y) {
    if (local.stackables.hasOwnProperty(itemId)) {
        //
    }
}
function stackablesPlace(local, itemId, wasOutside) {
    if (local.stackables.hasOwnProperty(itemId)) {
        const largest = stackablesFindOverlapping(local, itemId);
        if (largest !== null) {
            let stackingId = local.stackables[largest].onStacking;
            if (stackingId === null) {
                stackingId = stackingsCreateFor(local, largest);
                local.stackables[largest].onStacking = stackingId;
            }
            local.stackables[itemId].onStacking = stackingId;
        }
    }
}
function stackablesFindOverlapping(local, itemId) {
    let pixels = 500;
    let largest = null;
    if (local.stacks === null || local.overlaps === null) {
        throw new Error("Stacks or overlaps not yet computed");
    }
    for (const [otherId, stackable] of Object.entries(local.stackables)) {
        if (local.overlaps[itemId][otherId] > pixels) {
            pixels = local.overlaps[itemId][otherId];
            largest = otherId;
        }
    }
    return largest;
}
