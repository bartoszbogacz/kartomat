# Refactor Locatable, Turnable and Visual

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
    cssClasses: string[];
    current: number[];

In `locatable.ts` in `function locatablesRender` implement

- move setting `cssClasses` from during DOM element creation
  to during rendering, as the cssClasses might change during
  turning. Also remember too keep base class `LocatableItem`.

- setting correct side during rendering, c.f.
  `elem.style.backgroundImage = "url(" + trn.sides[trn.current] + ")";`

- turning by responding to placement, c.f.
  `function turnablesPlace` and `function turnablesTurn`. Note that
  `function stackingsTouch` in `stacking.ts` uses `function turnablesTurn`
  to flip all cards at once.

Modify `function stackingsTouch` in `stacking.ts` to use new functions
you implemented in `locatable.ts`.

Remove files `visual.ts` and `turnable.ts`.

At this point, the board definition files will no longer load.
Modify `DogAndMarbles.json`, `RummyAndPrivateArea.json`, and
`Avatars6.json` to new specifiction of components. The component
`Locatable` should contain exactly:

    "locatables": {
        "board": {
            "tick": 0,
            "ownedBy": null,
            "x": 0,
            "y": 0,
            "z": 0,
            "l": 0,
            "w": 770,
            "h": 770
            "images": ["boards/dog.jpeg"],
            "colors": ["white"],
            "cssClass": ["Board"],
            "current": 0
        },
        "marble1": {
            "tick": 0,
            "ownedBy": null,
            "y": 62,
            "x": 418,
            "h": 20,
            "w": 20,
            "z": 0,
            "l": 2
            "images": [""],
            "colors": ["Crimson"],
            "cssClasses": ["Marble"],
            "current": 0
        },

Marbles will only be part of `Locatable` and `Draggable`.

    "draggables": {
        "marble1": { "tick": 0, "ownedBy": null },
        ...

Cards will be part of `Locatable`, `Draggable`, and `Stackable`.

    "locatables": {
        "card1": {
            "tick": 0,
            "ownedBy": null,
            "x": 1,
            "y": 0,
            "z": 0,
            "l": 1,
            "w": 100,
            "h": 150,
            "images": ["rummy/club_1.png", "rummy/back_blue.png"],
            "colors": ["white"],
            "cssClasses": ["Card"],
            "current": 0

    "draggables": {
        "card1": { "tick": 0, "ownedBy": null },

    "stackables": {
        "card1": { "tick": 0, "ownedBy": null, "onStacking": "stacking1" },
