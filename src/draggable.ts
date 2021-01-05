interface DraggableItem extends Synchronized {}

function draggablesSynchronize(local: LocalGame, remote: RemoteGame) {
  local.draggables = unionLastWriterWins(local.draggables, remote.draggables);
}

function draggablesCompute(local: LocalGame) {
  //
}

function draggablesRender(local: LocalGame) {
  //
}

function draggablesClick(local: LocalGame, itemId: string) {
  if (local.draggables.hasOwnProperty(itemId)) {
    //
  }
}

function draggablesKeyUp(local: LocalGame, itemId: string) {
  if (local.draggables.hasOwnProperty(itemId)) {
    //
  }
}

function draggablesTake(local: LocalGame, itemId: string) {
  if (local.topZ !== null && local.locatables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = local.tick + 1;
    local.locatables[itemId].ownedBy = local.playerId;
    local.locatables[itemId].z = local.topZ + 1;
  }
}

function draggablesMove(
  local: LocalGame,
  itemId: string,
  x: number,
  y: number
) {
  if (local.locatables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = local.tick + 1;
    local.locatables[itemId].ownedBy = local.playerId;
    local.locatables[itemId].x = x;
    local.locatables[itemId].y = y;
  }
}

function draggablesPlace(
  local: LocalGame,
  itemId: string,
  wasOutside: boolean
) {
  //
}
