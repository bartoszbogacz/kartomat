interface StackingItem extends Synchronized {
  strides: number[];
  current: number;
}

function stackingsRender(local: GameState, computed: ComputedState) {
  if (computed.stacks === null || computed.locations === null) {
    throw new Error("Stacks or locations not yet computed.");
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
      computed.stacks.hasOwnProperty(itemId) &&
      computed.stacks[itemId].length > 1;
    const loc = computed.locations[itemId];

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

function stackingsCreateFor(
  local: GameState,
  computed: ComputedState,
  stackableId: string
): string {
  if (computed.stacks === null || computed.locations === null) {
    throw new Error("Stacks or locations not yet computed.");
  }

  for (let i = 0; i < 100; i++) {
    const stackingId = "stacking" + i;
    if (
      computed.stacks.hasOwnProperty(stackingId) &&
      computed.stacks[stackingId].length > 0
    ) {
      continue;
    }
    local.locatables[stackingId] = {
      tick: computed.tick,
      ownedBy: computed.playerId,
      x: computed.locations[stackableId].x,
      y: computed.locations[stackableId].y,
      z: computed.locations[stackableId].z,
      l: computed.locations[stackableId].l,
      w: computed.locations[stackableId].w,
      h: computed.locations[stackableId].h,
    };
    local.draggables[stackingId] = {
      tick: computed.tick,
      ownedBy: computed.playerId,
    };
    local.stackings[stackingId] = {
      tick: computed.tick,
      ownedBy: computed.playerId,
      strides: [30, 10, 1],
      current: 0,
    };
    return stackingId;
  }
  throw new Error("Exhausted stacking ids.");
}

function stackingsTouch(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (itemId.endsWith("FoldControl")) {
    const properId = itemId.slice(0, -"FoldControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Fold cards by advancing to next stride
      local.stackings[properId].tick = computed.tick;
      local.stackings[properId].ownedBy = computed.playerId;
      local.stackings[properId].current =
        (local.stackings[properId].current + 1) %
        local.stackings[properId].strides.length;
    }
  }
  if (computed.stacks !== null && itemId.endsWith("TurnControl")) {
    const properId = itemId.slice(0, -"TurnControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Turn cards by advancing to next side
      for (const stackableId of computed.stacks[properId]) {
        local.locatables[stackableId].tick = computed.tick;
        local.locatables[stackableId].ownedBy = computed.playerId;
        local.locatables[stackableId].x = -local.locatables[stackableId].x;

        if (local.turnables.hasOwnProperty(stackableId)) {
          turnablesTurn(local, computed, stackableId);
        }
      }
    }
  }
  if (computed.stacks !== null && itemId.endsWith("ShuffleControl")) {
    const properId = itemId.slice(0, -"ShuffleControl".length);
    if (local.stackings.hasOwnProperty(properId)) {
      // Shuffle cards by assigning random fractional index
      for (const stackableId of computed.stacks[properId]) {
        local.locatables[stackableId].tick = computed.tick;
        local.locatables[stackableId].ownedBy = computed.playerId;
        local.locatables[stackableId].x = Math.random();
      }
    }
  }
}

function stackingsPlace(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  wasOutside: boolean
) {
  if (computed.stacks !== null && local.stackings.hasOwnProperty(itemId)) {
    const largest = stackingsFindOverlapping(local, computed, itemId);
    if (largest !== null) {
      let stackingId = local.stackables[largest].onStacking;
      if (stackingId === null) {
        // Place stackable without a stacking on our stacking
        local.stackables[largest].tick = computed.tick;
        local.stackables[largest].ownedBy = computed.playerId;
        local.stackables[largest].onStacking = itemId;

        const [gapA, gapB] = stackablesFindGap(
          local,
          computed,
          itemId,
          largest
        );

        local.locatables[largest].tick = computed.tick;
        local.locatables[largest].ownedBy = computed.playerId;
        local.locatables[largest].x = (gapA + gapB) / 2;
      } else {
        // Place our stackables on target stacking
        // Start with a small offset from left (i + 1)
        // and end with a small offset to the right (N + 2)
        const [gapA, gapB] = stackablesFindGap(
          local,
          computed,
          stackingId,
          computed.stacks[itemId][0]
        );

        const N = computed.stacks[itemId].length;

        for (let i = 0; i < N; i++) {
          const stackableId = computed.stacks[itemId][i];

          local.stackables[stackableId].tick = computed.tick;
          local.stackables[stackableId].ownedBy = computed.playerId;
          local.stackables[stackableId].onStacking = stackingId;

          local.locatables[stackableId].tick = computed.tick;
          local.locatables[stackableId].ownedBy = computed.playerId;
          local.locatables[stackableId].x =
            gapA + ((i + 1) / (N + 2)) * (gapB - gapA);
        }
      }
    }
  }
}

function stackingsFindOverlapping(
  local: GameState,
  computed: ComputedState,
  itemId: string
): string | null {
  let pixels: number = 500;
  let largest: string | null = null;

  if (computed.stacks === null || computed.locations === null) {
    throw new Error("Stacks or locations not yet computed");
  }

  for (const [otherId, stackable] of Object.entries(local.stackables)) {
    const stratId = overlapsAnyDivider(local, computed, itemId);
    const overlap = overlapMuch(
      computed.locations[itemId],
      computed.locations[otherId]
    );
    const ownsTarget = local.locatables[otherId].ownedBy === computed.playerId;
    const yourself = stackable.onStacking === itemId;

    if (
      overlap > pixels &&
      !yourself &&
      ((stratId && ownsTarget) || !stratId)
    ) {
      pixels = overlap;
      largest = otherId;
    }
  }

  return largest;
}
