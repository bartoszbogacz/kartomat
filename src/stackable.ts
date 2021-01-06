interface StackableItem extends Synchronized {
  onStacking: string | null;
}

function stackablesSynchronize(local: LocalGame, remote: RemoteGame) {
  local.stackables = unionLastWriterWins(local.stackables, remote.stackables);
}

function stackablesCompute(local: LocalGame) {
  // TODO: Currently local.locatables is used for both remote synchronization
  // and local visualisation. On every frame locatables are transformed by
  // stackings and stratifiers for proper layouting, and the only reason
  // those changes are not propagated to all remote peers is that tick
  // and ownedBy are not updated. Such a scheme will fail the moment
  // we switch to an automatic detection of changes.

  local.stacks = {};

  for (const [key, st] of Object.entries(local.stackables)) {
    if (st.onStacking !== null) {
      if (local.stacks.hasOwnProperty(st.onStacking)) {
        local.stacks[st.onStacking].push(key);
      } else {
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

function stackablesRender(local: LocalGame) {
  //
}

function stackablesClick(local: LocalGame, itemId: string) {
  if (local.stackables.hasOwnProperty(itemId)) {
    //
  }
}

function stackablesKeyUp(local: LocalGame, itemId: string) {
  if (local.stackables.hasOwnProperty(itemId)) {
    //
  }
}

function stackablesTake(local: LocalGame, itemId: string) {
  if (local.stackables.hasOwnProperty(itemId)) {
    local.stackables[itemId].tick = local.tick + 1;
    local.stackables[itemId].ownedBy = local.playerId;
    local.stackables[itemId].onStacking = null;
  }
}

function stackablesMove(
  local: LocalGame,
  itemId: string,
  x: number,
  y: number
) {
  if (local.stackables.hasOwnProperty(itemId)) {
    //
  }
}

function stackablesPlace(
  local: LocalGame,
  itemId: string,
  wasOutside: boolean
) {
  if (local.stackables.hasOwnProperty(itemId)) {
    const largest = stackablesFindOverlapping(local, itemId);
    if (largest !== null) {
      let stackingId = local.stackables[largest].onStacking;
      if (stackingId === null) {
        // FIXME: Freshly created stack, local.stacks does not
        // yet contain it, however, stackablesFindGap requires
        // it to find a suitable x value. Current workaround
        // uses an initial x.
        stackingId = stackingsCreateFor(local, largest);
        local.stackables[largest].tick = local.tick + 1;
        local.stackables[largest].ownedBy = local.playerId;
        local.stackables[largest].onStacking = stackingId;

        local.locatables[largest].tick = local.tick + 1;
        local.locatables[largest].ownedBy = local.playerId;
        local.locatables[largest].x = 0;

        local.stackables[itemId].tick = local.tick + 1;
        local.stackables[itemId].ownedBy = local.playerId;
        local.stackables[itemId].onStacking = stackingId;

        local.locatables[itemId].tick = local.tick + 1;
        local.locatables[itemId].ownedBy = local.playerId;
        local.locatables[itemId].x = 1;
      } else {
        local.stackables[itemId].tick = local.tick + 1;
        local.stackables[itemId].ownedBy = local.playerId;
        local.stackables[itemId].onStacking = stackingId;

        local.locatables[itemId].tick = local.tick + 1;
        local.locatables[itemId].ownedBy = local.playerId;
        local.locatables[itemId].x = stackablesFindGap(
          local,
          stackingId,
          itemId
        );
      }
    }
  }
}

function stackablesFindOverlapping(
  local: LocalGame,
  itemId: string
): string | null {
  let pixels: number = 500;
  let largest: string | null = null;

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

function stackablesFindGap(
  local: LocalGame,
  stackingId: string,
  itemId: string
): number {
  if (local.stacks === null) {
    return 0;
  }

  let posX: number = 0;

  for (const otherId of local.stacks[stackingId]) {
    if (local.locatables[otherId].x > local.locatables[itemId].x) {
      return (posX + local.locatables[otherId].x) / 2;
    } else {
      posX = local.locatables[otherId].x;
    }
  }

  // Reached last stackable. Put the new stackable behind that one.
  return posX + 1;
}
