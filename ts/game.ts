interface GameCvrdt {
  readonly movables: LWWMap<Moveable>;
  readonly stackings: LWWMap<Stacking>;
  readonly stackables: LWWMap<Stackable>;
  readonly turnables: LWWMap<Turnable>;
}

interface Game {
  tick: number;
  playerId: string;
}

function render(game: GameCvrdt) {
  const stacks = stackableStacks(game.stackables);
  const overlaps = moveablesOverlaps(game.movables);
  stackableTransform(stacks, game.movables);

  moveablesRender(game.movables);
  stackingsRender(stacks, game.movables);
  turnablesRender(game.movables, game.turnables);
}
