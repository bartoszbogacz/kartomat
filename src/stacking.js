"use strict";
function stackingsSynchronize(local, remote) {
    local.stackings = unionLastWriterWins(local.stackings, remote.stackings);
}
function stackingsCompute(local) {
    //
}
function stackingsRender(local) {
    if (local.stacks === null) {
        throw new Error("Overlaps not yet computed.");
    }
    for (const [itemId, stacking] of Object.entries(local.stackings)) {
        let move = document.getElementById(itemId + "MoveControl");
        if (move === null) {
            move = document.createElement("div");
            move.id = itemId + "MoveControl";
            move.className = "MoveControl";
            move.style.position = "absolute";
            move.style.width = "30px";
            move.style.height = "30px";
            move.style.backgroundImage = 'url("controls/move.png")';
            move.style.backgroundSize = "30px 30px";
            document.body.appendChild(move);
        }
        let shuffle = document.getElementById(itemId + "ShuffleControl");
        if (shuffle === null) {
            shuffle = document.createElement("div");
            shuffle.id = itemId + "ShuffleControl";
            shuffle.className = "ShuffleControl";
            shuffle.style.position = "absolute";
            shuffle.style.width = "30px";
            shuffle.style.height = "30px";
            shuffle.style.backgroundImage = 'url("controls/shuffle.png")';
            shuffle.style.backgroundSize = "30px 30px";
            document.body.appendChild(shuffle);
        }
        let fold = document.getElementById(itemId + "FoldControl");
        if (fold === null) {
            fold = document.createElement("div");
            fold.id = itemId + "FoldControl";
            fold.className = "FoldControl";
            fold.style.position = "absolute";
            fold.style.width = "30px";
            fold.style.height = "30px";
            fold.style.backgroundImage = 'url("controls/fold.png")';
            fold.style.backgroundSize = "30px 30px";
            document.body.appendChild(fold);
        }
        let turn = document.getElementById(itemId + "TurnControl");
        if (turn === null) {
            turn = document.createElement("div");
            turn.id = itemId + "TurnControl";
            turn.className = "TurnControl";
            turn.style.position = "absolute";
            turn.style.width = "30px";
            turn.style.height = "30px";
            turn.style.backgroundImage = 'url("controls/turn.png")';
            turn.style.backgroundSize = "30px 30px";
            document.body.appendChild(turn);
        }
        const s = local.stacks.hasOwnProperty(itemId) && local.stacks[itemId].length > 1;
        const m = local.moveables[itemId];
        if (s === true) {
            move.style.left = m.x - 30 + "px";
            move.style.top = m.y + "px";
            move.style.zIndex = m.z + "px";
            move.style.visibility = "visible";
        }
        else {
            move.style.visibility = "hidden";
        }
        if (s === true) {
            shuffle.style.left = m.x - 30 + "px";
            shuffle.style.top = m.y + 30 + "px";
            shuffle.style.zIndex = m.z + "px";
            shuffle.style.visibility = "visible";
        }
        else {
            shuffle.style.visibility = "hidden";
        }
        if (s === true) {
            fold.style.left = m.x - 30 + "px";
            fold.style.top = m.y + 60 + "px";
            fold.style.zIndex = m.z + "px";
            fold.style.visibility = "visible";
        }
        else {
            fold.style.visibility = "hidden";
        }
        if (s === true) {
            turn.style.left = m.x - 30 + "px";
            turn.style.top = m.y + 90 + "px";
            turn.style.zIndex = m.z + "px";
            turn.style.visibility = "visible";
        }
        else {
            turn.style.visibility = "hidden";
        }
    }
}
function stackingsCreateFor(local, stackableId) {
    for (let i = 0; i < 100; i++) {
        const stackingId = local.playerId + "stacking" + i;
        if (local.stackings.hasOwnProperty(stackingId) === false) {
            local.moveables[stackingId] = {
                tick: local.tick + 1,
                ownedBy: local.playerId,
                x: local.moveables[stackableId].x,
                y: local.moveables[stackableId].y,
                z: local.moveables[stackableId].z,
                w: local.moveables[stackableId].w,
                h: local.moveables[stackableId].h,
            };
            local.stackings[stackingId] = {
                tick: local.tick + 1,
                ownedBy: local.playerId,
                strides: [1, 30],
                current: 0,
            };
            return stackingId;
        }
    }
    throw new Error("Exhausted stacking ids.");
}
function stackingsTake(local, itemId) {
    //
}
function stackingsMove(local, itemId, x, y) {
    //
}
function stackingsPlace(local, itemId) {
    //
}
