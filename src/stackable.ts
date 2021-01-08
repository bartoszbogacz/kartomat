interface StackableItem extends Synchronized {
  onStacking: string | null;
}

function stackablesCompute(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  computed.stacks = {};

  for (const [key, st] of Object.entries(local.stackables)) {
    if (st.onStacking !== null) {
      if (computed.stacks.hasOwnProperty(st.onStacking)) {
        computed.stacks[st.onStacking].push(key);
      } else {
        computed.stacks[st.onStacking] = [key];
      }
    }
  }

  for (const [_, st] of Object.entries(computed.stacks)) {
    st.sort((a, b) => local.locatables[a].x - local.locatables[b].x);
  }

  for (const [stackingId, stack] of Object.entries(computed.stacks)) {
    const stacking_s = local.stackings[stackingId];
    const stacking_m = computed.locations[stackingId];
    const stride = stacking_s.strides[stacking_s.current];
    for (let i = 0; i < stack.length; i++) {
      computed.locations[stack[i]].x = stacking_m.x + i * stride;
      computed.locations[stack[i]].y = stacking_m.y;
      computed.locations[stack[i]].z = stacking_m.z + i;
    }
  }
}

function stackablesTake(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed");
  }

  if (local.stackables.hasOwnProperty(itemId)) {
    local.stackables[itemId].tick = computed.tick;
    local.stackables[itemId].ownedBy = computed.playerId;
    local.stackables[itemId].onStacking = null;

    local.locatables[itemId].tick = computed.tick;
    local.locatables[itemId].ownedBy = computed.playerId;
    local.locatables[itemId].x = computed.locations[itemId].x;
    local.locatables[itemId].y = computed.locations[itemId].y;
    local.locatables[itemId].z = locatableOnTopZ(computed.locations) + 1;
  }
}

function stackablesPlace(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  wasOutside: boolean
) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  if (local.stackables.hasOwnProperty(itemId)) {
    const largest = stackablesFindOverlapping(local, computed, itemId);
    if (largest !== null) {
      let stackingId = local.stackables[largest].onStacking;
      if (stackingId === null) {
        // Freshly created stack. There is as of yet no other
        // stackables present to related the newly placed cards.
        // To put the into relation, just use their visual (computed)
        // x values.
        stackingId = stackingsCreateFor(local, computed, largest);
        local.stackables[largest].tick = computed.tick;
        local.stackables[largest].ownedBy = computed.playerId;
        local.stackables[largest].onStacking = stackingId;

        local.locatables[largest].tick = computed.tick;
        local.locatables[largest].ownedBy = computed.playerId;
        local.locatables[largest].x = computed.locations[largest].x;

        local.stackables[itemId].tick = computed.tick;
        local.stackables[itemId].ownedBy = computed.playerId;
        local.stackables[itemId].onStacking = stackingId;

        local.locatables[itemId].tick = computed.tick;
        local.locatables[itemId].ownedBy = computed.playerId;
        local.locatables[itemId].x = computed.locations[itemId].x;
      } else {
        local.stackables[itemId].tick = computed.tick;
        local.stackables[itemId].ownedBy = computed.playerId;
        local.stackables[itemId].onStacking = stackingId;

        const [gapA, gapB] = stackablesFindGap(
          local,
          computed,
          stackingId,
          itemId
        );
        local.locatables[itemId].tick = computed.tick;
        local.locatables[itemId].ownedBy = computed.playerId;
        local.locatables[itemId].x = (gapA + gapB) / 2;
      }
    }
  }
}

function stackablesFindOverlapping(
  local: GameState,
  computed: ComputedState,
  itemId: string
): string | null {
  let pixels: number = 500;
  let largest: string | null = null;

  if (computed.locations === null || computed.stacks === null) {
    throw new Error("Stacks or locations not yet computed");
  }

  for (const [otherId, stackable] of Object.entries(local.stackables)) {
    if (itemId === otherId) {
      continue;
    }

    const stratId = overlapsAnyDivider(local, computed, itemId);
    const overlap = overlapMuch(
      computed.locations[itemId],
      computed.locations[otherId]
    );
    const ownsTarget = local.locatables[otherId].ownedBy === computed.playerId;

    if (overlap > pixels && ((stratId && ownsTarget) || !stratId)) {
      pixels = overlap;
      largest = otherId;
    }
  }

  return largest;
}

function stackablesFindGap(
  local: GameState,
  computed: ComputedState,
  stackingId: string,
  itemId: string
): [number, number] {
  if (computed.stacks === null || computed.locations === null) {
    throw new Error("Stacks and locations not yet computed.");
  }

  let posX: number = 0;

  for (const otherId of computed.stacks[stackingId]) {
    // We use a small offset to bias stackable insertion to the left.
    // If you put a stackable very close on top to another one, the new
    // stackable will be placed on the left.
    if (computed.locations[otherId].x + 10 > computed.locations[itemId].x) {
      return [posX, local.locatables[otherId].x];
    } else {
      posX = local.locatables[otherId].x;
    }
  }

  // Reached last stackable. Put the new stackable behind that one.
  return [posX, posX + 1];
}
