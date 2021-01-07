interface StratifierItem extends Synchronized {
  //
}

function dividersCompute(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  const groups: { [key: number]: string[] } = {};

  for (const [key, loc] of Object.entries(local.locatables)) {
    if (groups.hasOwnProperty(loc.l)) {
      groups[loc.l].push(key);
    } else {
      groups[loc.l] = [key];
    }
  }

  let accumZ = 0;

  for (const [layer, stratifiedIds] of Object.entries(groups)) {
    stratifiedIds.sort(
      (a, b) =>
        (computed.locations as any)[a].z - (computed.locations as any)[b].z
    );

    // Stratifier needs to run before stackings and does not know
    // about the extents of stackings. We assume that stackings are
    // never more than 100 elements deep.

    for (const stratifiedId of stratifiedIds) {
      if (
        local.locatables[stratifiedId].ownedBy !== computed.playerId ||
        overlapsAnyDivider(local, computed, stratifiedId) === null
      ) {
        computed.locations[stratifiedId].z = accumZ;
        accumZ += 100;
      }
    }

    for (const [dividerId, divider] of Object.entries(local.dividers)) {
      // Only put the dividers of the current layer in the middle.
      if (local.locatables[dividerId].l.toString() === layer) {
        computed.locations[dividerId].z = accumZ;
        accumZ += 1;
      }
    }

    for (const stratifiedId of stratifiedIds) {
      if (
        local.locatables[stratifiedId].ownedBy === computed.playerId &&
        overlapsAnyDivider(local, computed, stratifiedId) !== null
      ) {
        computed.locations[stratifiedId].z = accumZ;
        accumZ += 100;
      }
    }
  }
}

function overlapsAnyDivider(
  local: GameState,
  computed: ComputedState,
  itemId: string
): string | null {
  if (computed.overlaps === null) {
    throw new Error("Overlaps not yet computed");
  }

  // FIXME: Items go slightly into private area before actually being on top
  // of it.

  for (const [dividerId, divider] of Object.entries(local.dividers)) {
    if (computed.overlaps[itemId][dividerId] > 0) {
      return dividerId;
    }
  }

  return null;
}
