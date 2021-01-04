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
        st.sort((a, b) => local.stackables[a].atIndex - local.stackables[b].atIndex);
    }
    for (const [stackingId, stack] of Object.entries(local.stacks)) {
        const stacking_s = local.stackings[stackingId];
        const stacking_m = local.moveables[stackingId];
        const stride = stacking_s.strides[stacking_s.current];
        for (let i = 0; i < stack.length; i++) {
            local.moveables[stack[i]].x = stacking_m.x + (i + 1) * stride;
            local.moveables[stack[i]].y = stacking_m.y;
            local.moveables[stack[i]].z = i + 1;
        }
    }
}
function stackablesRender(local) {
    //
}
function stackablesTake(local, itemId) {
    local.stackables[itemId].onStacking = null;
}
function stackablesMove(local, itemId, x, y) {
    //
}
function stackablesPlace(local, itemId) {
    const largest = stackableFindOverlapping(local, itemId);
    if (largest !== null) {
        let stackingId = local.stackables[largest].onStacking;
        if (stackingId === null) {
            stackingId = stackingsCreateFor(local, largest);
        }
        local.stackables[largest].onStacking = stackingId;
        local.stackables[largest].atIndex = 0;
        local.stackables[itemId].onStacking = stackingId;
        local.stackables[itemId].atIndex = 0;
    }
}
function stackableFindOverlapping(local, itemId) {
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
