interface StackingItem extends Synchronized {
  strides: number[];
  current: number;
}

function stackingsSynchronize(local: LocalGame, remote: RemoteGame) {
  local.stackings = unionLastWriterWins(local.stackings, remote.stackings);
}

function stackingsCompute(local: LocalGame) {
  //
}

function stackingsRender(local: LocalGame) {
  if (local.stacks === null) {
    throw new Error("Stacks not yet computed.");
  }

  for (const [itemId, stacking] of Object.entries(local.stackings)) {
    let move = document.getElementById(itemId);
    if (move === null) {
      move = document.createElement("div");
      move.id = itemId;
      move.onmousedown = onMouseDown;
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
      shuffle.onclick = onClick;
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
      fold.onclick = onClick;
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
      turn.onclick = onClick;
      turn.className = "TurnControl";
      turn.style.position = "absolute";
      turn.style.width = "30px";
      turn.style.height = "30px";
      turn.style.backgroundImage = 'url("controls/turn.png")';
      turn.style.backgroundSize = "30px 30px";
      document.body.appendChild(turn);
    }

    const s =
      local.stacks.hasOwnProperty(itemId) && local.stacks[itemId].length > 1;
    const loc = local.locatables[itemId];

    if (s === true) {
      move.style.left = loc.x - 30 + "px";
      move.style.top = loc.y + "px";
      move.style.zIndex = loc.z.toString();
      move.style.visibility = "visible";
    } else {
      move.style.visibility = "hidden";
    }

    if (s === true) {
      shuffle.style.left = loc.x - 30 + "px";
      shuffle.style.top = loc.y + 30 + "px";
      shuffle.style.zIndex = loc.z.toString();
      shuffle.style.visibility = "visible";
    } else {
      shuffle.style.visibility = "hidden";
    }

    if (s === true) {
      fold.style.left = loc.x - 30 + "px";
      fold.style.top = loc.y + 60 + "px";
      fold.style.zIndex = loc.z.toString();
      fold.style.visibility = "visible";
    } else {
      fold.style.visibility = "hidden";
    }

    if (s === true) {
      turn.style.left = loc.x - 30 + "px";
      turn.style.top = loc.y + 90 + "px";
      turn.style.zIndex = loc.z.toString();
      turn.style.visibility = "visible";
    } else {
      turn.style.visibility = "hidden";
    }
  }
}

function stackingsCreateFor(local: LocalGame, stackableId: string): string {
  if (local.stacks === null) {
    throw new Error("Stacks not yet computed.");
  }

  for (let i = 0; i < 100; i++) {
    const stackingId = local.playerId + "stacking" + i;
    if (
      local.stacks.hasOwnProperty(stackingId) &&
      local.stacks[stackingId].length > 0
    ) {
      continue;
    }
    local.locatables[stackingId] = {
      tick: local.tick + 1,
      ownedBy: local.playerId,
      x: local.locatables[stackableId].x,
      y: local.locatables[stackableId].y,
      z: local.locatables[stackableId].z,
      w: local.locatables[stackableId].w,
      h: local.locatables[stackableId].h,
    };
    local.stackings[stackingId] = {
      tick: local.tick + 1,
      ownedBy: local.playerId,
      strides: [30, 10, 1],
      current: 0,
    };
    return stackingId;
  }
  throw new Error("Exhausted stacking ids.");
}

function stackingsClick(local: LocalGame, itemId: string) {
  if (itemId.endsWith("FoldControl")) {
    const properId = itemId.slice(0, -"FoldControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Fold cards by advancing to next stride
      local.stackings[properId].current =
        (local.stackings[properId].current + 1) %
        local.stackings[properId].strides.length;
    }
  }
  if (local.stacks !== null && itemId.endsWith("TurnControl")) {
    const properId = itemId.slice(0, -"TurnControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Turn cards by advancing to next side
      for (const stackableId of local.stacks[properId]) {
        if (local.turnables.hasOwnProperty(stackableId)) {
          turnablesTurn(local, stackableId);
        }
      }
    }
  }
  if (local.stacks !== null && itemId.endsWith("ShuffleControl")) {
    const properId = itemId.slice(0, -"ShuffleControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Shuffle cards by assigning random fractional index
      for (const stackableId of local.stacks[properId]) {
        local.locatables[stackableId].x = Math.random();
      }
    }
  }
}

function stackingsKeyUp(local: LocalGame, itemId: string) {
  if (local.stackings.hasOwnProperty(itemId)) {
    //
  }
}

function stackingsTake(local: LocalGame, itemId: string) {
  if (local.stackings.hasOwnProperty(itemId)) {
    //
  }
}

function stackingsMove(local: LocalGame, itemId: string, x: number, y: number) {
  if (local.stackings.hasOwnProperty(itemId)) {
    //
  }
}

function stackingsPlace(local: LocalGame, itemId: string, wasOutside: boolean) {
  if (local.stacks !== null && local.stackings.hasOwnProperty(itemId)) {
    const largest = stackingsFindOverlapping(local, itemId);
    if (largest !== null) {
      let stackingId = local.stackables[largest].onStacking;
      if (stackingId === null) {
        local.stackables[largest].onStacking = itemId;
      } else {
        for (const stackableId of local.stacks[itemId]) {
          local.stackables[stackableId].onStacking = stackingId;
        }
      }
    }
  }
}

function stackingsFindOverlapping(
  local: LocalGame,
  itemId: string
): string | null {
  let pixels: number = 500;
  let largest: string | null = null;

  if (local.stacks === null || local.overlaps === null) {
    throw new Error("Stacks or overlaps not yet computed");
  }

  for (const [otherId, stackable] of Object.entries(local.stackables)) {
    if (
      stackable.onStacking !== itemId &&
      local.overlaps[itemId][otherId] > pixels
    ) {
      pixels = local.overlaps[itemId][otherId];
      largest = otherId;
    }
  }

  return largest;
}
