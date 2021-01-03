interface GameCvrdt {
  movables: LWWMap<Moveable>;
  stackings: LWWMap<Stacking>;
  stackables: LWWMap<Stackable>;
  turnables: LWWMap<Turnable>;
}

interface GameComputed {
  tick: number;
  playerId: string;
  moveables: { [key: string]: Moveable };
}

function render(game: GameCvrdt) {
  const stacks = stackableStacks(game.stackables);
  const moveables = stackableTransform(stacks, game.movables);
  const overlaps = moveablesOverlaps(game.movables);

  moveablesRender(moveables);
  stackingsRender(stacks, moveables);
  turnablesRender(moveables, game.turnables);
}
