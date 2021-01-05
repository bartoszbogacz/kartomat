interface StrafierItem extends Synchronized {
  splitByPlayer: boolean;
  group: string[];
}

function stratifiersSynchronize(local: LocalGame, remote: RemoteGame) {
  local.stratifiers = unionLastWriterWins(
    local.stratifiers,
    remote.stratifiers
  );
}

function stratifiersCompute(local: LocalGame) {
  for (const [stratifierId, stratifier] of Object.entries(local.stratifiers)) {
    stratifier.group.sort(
      (a, b) => local.locatables[a].z - local.locatables[b].z
    );

    if (stratifier.splitByPlayer) {
      let accumZ = Math.min(
        local.locatables[stratifierId].z,
        local.locatables[stratifier.group[0]].z
      );

      for (const itemId of stratifier.group) {
        if (local.locatables[itemId].ownedBy !== local.playerId) {
          local.locatables[itemId].z = accumZ;
          accumZ = accumZ + 1;
        }
      }

      local.locatables[stratifierId].z = accumZ;
      accumZ = accumZ + 1;

      for (const itemId of stratifier.group) {
        if (local.locatables[itemId].ownedBy === local.playerId) {
          local.locatables[itemId].z = accumZ;
          accumZ = accumZ + 1;
        }
      }
    } else {
      let accumZ = local.locatables[stratifierId].z;
      accumZ = accumZ + 1;

      for (const itemId of stratifier.group) {
        local.locatables[itemId].z = accumZ;
        accumZ = accumZ + 1;
      }
    }
  }
}

function stratifiersRender(local: LocalGame) {
  //
}

function stratifiersClick(local: LocalGame, itemId: string) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}

function stratifiersKeyUp(local: LocalGame, itemId: string) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}

function stratifiersTake(local: LocalGame, itemId: string) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}

function stratifiersMove(
  local: LocalGame,
  itemId: string,
  x: number,
  y: number
) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}

function stratifiersPlace(
  local: LocalGame,
  itemId: string,
  wasOutside: boolean
) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}

function stratifiersTurn(local: LocalGame, itemId: string) {
  if (local.stratifiers.hasOwnProperty(itemId)) {
    //
  }
}
