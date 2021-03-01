# Refactor Turnable and Visual

Currently `Locatable` provides properties `x, y, w, h, z, l` with functions
`overlapMuch`, `locatablesTopZ`, and also a `render` which places and resizes
a DOM element that `Locatable` does not actually style in any way.

Meanwhile `Visual` provides only `cssClass` that it uses to style some elements
and does nothing else.

Finally `Turnable` provides `sides` that contain an image that is being drawn for
both cards and boards.

Merge `Turnable` and `Visual` into `Locatable`. It will handle location and
visuals in the same place. Also it will handle turning. Zero sides disable
rendering. One side enables rendering but disables turning. Two or more sides
enabled rendering and turning.

From `client.ts` remove in `GameState`

    turnables: { [key: string]: TurnableItem };
    visuals: { [key: string]: VisualItem };

and in `_localGame` and `_remoteGame` remove

    visuals: {},
    turnables: {},

In `function handleServerMessage(msg: any)` remove

    _localGame.turnables = unionLastWriterWins(
        _localGame.turnables,
        _remoteGame.turnables
    );
    _localGame.visuals = unionLastWriterWins(
        _localGame.visuals,
        _remoteGame.visuals
    );

In `function render()` remove

    visualsRender(_localGame, _computed);
    turnablesRender(_localGame, _computed);

In `function onMouseUp` change

    turnablesPlace(_localGame, _computed, thingId, _drag.wasOutside);

to a new `locatablesPlace`.

In `locatable.ts` change `interface Locatable` by adding

    images: string[];
    colors: string[];
    cssClass: string[];
    current: number[];

In `locatable.ts` in `function locatablesRender` implement

- move setting `cssClass` from during DOM element creation
  to during rendering, as the cssClass might change during
  turning. Also remember too keep base class `LocatableItem`.
- setting correct side during rendering, c.f.

  elem.style.backgroundImage = "url(" + trn.sides[trn.current] + ")";

- turning by responding to placement, c.f.
  `function turnablesPlace` and `function turnablesTurn`. Note that
  `function stackingsTouch` in `stacking.ts` uses `function turnablesTurn`
  to flip all cards at once.

Modify `function stackingsTouch` in `stacking.ts` to use new functions
you implemented in `locatable.ts`.

Remove files `visual.ts` and `turnable.ts`.
