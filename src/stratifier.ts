interface StratifierItem extends Synchronized {
  splitByPlayer: boolean;
  group: string[];
}

function stratifiersCompute(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  const stratifierIds = Object.keys(local.stratifiers);
  stratifierIds.sort(
    (a, b) =>
      (computed.locations as any)[a].z - (computed.locations as any)[b].z
  );
  let accumZ = 0;

  for (const stratifierId of stratifierIds) {
    const stratifier = local.stratifiers[stratifierId];

    stratifier.group.sort(
      (a, b) =>
        (computed.locations as any)[a].z - (computed.locations as any)[b].z
    );

    if (stratifier.splitByPlayer) {
      for (const itemId of stratifier.group) {
        if (computed.locations[itemId].ownedBy !== computed.playerId) {
          computed.locations[itemId].z = accumZ;
          accumZ = accumZ + 1;
        }
      }

      computed.locations[stratifierId].z = accumZ;
      accumZ = accumZ + 1;

      for (const itemId of stratifier.group) {
        if (computed.locations[itemId].ownedBy === computed.playerId) {
          computed.locations[itemId].z = accumZ;
          accumZ = accumZ + 1;
        }
      }
    } else {
      computed.locations[stratifierId].z = accumZ;

      for (const itemId of stratifier.group) {
        computed.locations[itemId].z = accumZ;
        accumZ = accumZ + 1;
      }
    }
  }
}
