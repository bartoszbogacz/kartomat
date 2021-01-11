interface DraggableItem extends Synchronized {
  //
}

function draggablesTake(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (computed.locations !== null && local.draggables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = computed.tick;
    local.locatables[itemId].ownedBy = computed.playerId;
    local.locatables[itemId].z = locatablesTopZ(computed.locations) + 1;
  }
}

function draggablesMove(
  local: GameState,
  computed: ComputedState,
  itemId: string,
  x: number,
  y: number
) {
  if (local.draggables.hasOwnProperty(itemId)) {
    local.locatables[itemId].tick = computed.tick;
    local.locatables[itemId].ownedBy = computed.playerId;
    local.locatables[itemId].x = x;
    local.locatables[itemId].y = y;
  }
}
