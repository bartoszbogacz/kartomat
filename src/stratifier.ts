interface StratifierItem extends Synchronized {
  //
}

function stratifiersCompute(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  const groups: { [key: string]: string[] } = {};

  for (const [key, st] of Object.entries(local.stratified)) {
    if (st.inLayer !== null) {
      if (groups.hasOwnProperty(st.inLayer)) {
        groups[st.inLayer].push(key);
      } else {
        groups[st.inLayer] = [key];
      }
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
        overlapsAnyStratifier(local, computed, stratifiedId) === null
      ) {
        computed.locations[stratifiedId].z = accumZ;
        accumZ += 100;
      }
    }

    for (const [stratifierId, stratifier] of Object.entries(
      local.stratifiers
    )) {
      computed.locations[stratifierId].z = accumZ;
      accumZ += 1;
    }

    for (const stratifiedId of stratifiedIds) {
      if (
        local.locatables[stratifiedId].ownedBy === computed.playerId &&
        overlapsAnyStratifier(local, computed, stratifiedId) !== null
      ) {
        computed.locations[stratifiedId].z = accumZ;
        accumZ += 100;
      }
    }
  }
}

function overlapsAnyStratifier(
  local: GameState,
  computed: ComputedState,
  itemId: string
): string | null {
  if (computed.overlaps === null) {
    throw new Error("Overlaps not yet computed");
  }

  // FIXME: Items go slightly into private area before actually being on top
  // of it.

  for (const [stratifierId, stratifier] of Object.entries(local.stratifiers)) {
    if (computed.overlaps[itemId][stratifierId] > 0) {
      return stratifierId;
    }
  }

  return null;
}
