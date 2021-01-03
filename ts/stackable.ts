interface Stackable extends Synchronized {
  onStacking: string | null;
  atIndex: number;
}

function stackableStacks(stackables: {
  [key: string]: Stackable;
}): { [key: string]: [string] } {
  const stacks: { [key: string]: [string] } = {};

  for (const [key, st] of Object.entries(stackables)) {
    if (st.onStacking !== null) {
      stacks[st.onStacking].push(key);
    }
  }

  for (const [_, st] of Object.entries(stacks)) {
    st.sort((a, b) => stackables[a].atIndex - stackables[b].atIndex);
  }

  return stacks;
}

function stackableTransform(
  stacks: { [key: string]: [string] },
  movables: { [key: string]: Moveable }
) {
  for (const [key, stack] of Object.entries(stacks)) {
    for (let i = 0; i < stack.length; i++) {
      movables[stack[i]] = {
        tick: movables[stack[i]].tick,
        ownedBy: movables[stack[i]].ownedBy,
        x: movables[stack[i]].x,
        y: movables[stack[i]].y,
        z: movables[stack[i]].z,
        w: movables[stack[i]].w,
        h: movables[stack[i]].h,
      };
    }
  }
}

function stackableJoinStacking(
  stackableId: string,
  stackables: { [key: string]: Stackable },
  stacks: { [key: string]: [string] },
  overlaps: { [a: string]: { [b: string]: number } },
  game: Game
) {
  const largest = stackableFindStacking(stackableId, stacks, overlaps);
  stackables[stackableId] = {
    tick: game.tick,
    ownedBy: game.playerId,
    onStacking: largest,
    atIndex: 0,
  };
}

function stackableLeaveStacking(
  stackableId: string,
  stackables: { [key: string]: Stackable }
) {
  stackables[stackableId].onStacking = null;
}

function stackableFindStacking(
  stackableId: string,
  stacks: { [key: string]: [string] },
  overlaps: { [a: string]: { [b: string]: number } }
): string | null {
  let pixels: number | null = null;
  let largest: string | null = null;

  for (const [stackingId, stack] of Object.entries(stacks)) {
    for (const otherId of stack) {
      if (pixels !== null && overlaps[stackableId][otherId] > pixels) {
        pixels = overlaps[stackableId][otherId];
        largest = stackingId;
      }
    }
  }

  return largest;
}
