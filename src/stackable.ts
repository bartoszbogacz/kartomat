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
  moveables: { [key: string]: Moveable }
): { [key: string]: Moveable } {
  let result: { [key: string]: Moveable } = {};

  for (const [key, stack] of Object.entries(stacks)) {
    for (let i = 0; i < stack.length; i++) {
      result[stack[i]] = {
        tick: moveables[stack[i]].tick,
        ownedBy: moveables[stack[i]].ownedBy,
        x: moveables[stack[i]].x,
        y: moveables[stack[i]].y,
        z: moveables[stack[i]].z,
        w: moveables[stack[i]].w,
        h: moveables[stack[i]].h,
      };
    }
  }

  for (const [key, m] of Object.entries(moveables)) {
    if (result.hasOwnProperty(key)) {
      // Moveable already transformed
    } else {
      result[key] = {
        tick: m.tick,
        ownedBy: m.ownedBy,
        x: m.x,
        y: m.y,
        z: m.z,
        w: m.w,
        h: m.h,
      };
    }
  }

  return result;
}

function stackableJoinStacking(
  stackableId: string,
  stackables: { [key: string]: Stackable },
  stacks: { [key: string]: [string] },
  overlaps: { [a: string]: { [b: string]: number } }
) {
  const largest = stackableFindStacking(stackableId, stacks, overlaps);
  stackables[stackableId].onStacking = largest;
  stackables[stackableId].atIndex = 0;
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
