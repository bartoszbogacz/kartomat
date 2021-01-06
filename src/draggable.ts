interface DraggableItem extends Synchronized {
  //
}

function draggablesTake(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (computed.topZ !== null && local.locatables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = computed.tick + 1;
    local.locatables[itemId].ownedBy = computed.playerId;
    local.locatables[itemId].z = computed.topZ + 1;
  }
}

function draggablesMove(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  x: number,
  y: number
) {
  if (local.locatables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = computed.tick + 1;
    local.locatables[itemId].ownedBy = computed.playerId;
    local.locatables[itemId].x = x;
    local.locatables[itemId].y = y;
  }
}
