# Refactor Turnable and Visual

Merge Turnable and Visual into one Component that provides rendering for all
entities. It contains for each side, the backgroundColor, the backgroundShape,
the backgroundImage, and the size of the HTML element, and a customCSS for overriding
properties. It also contains a probability transition matrix for turning things around.
A game board is a turnable with one side. A marble is a turnable with one side.

Turnable will take on rendering all using an image, a color, and a css class.

Properties x, y, w, h, z, l are currently provided by locatable.
Who gets control of the DOM element? Others need it for attaching
handlers? What about locatables that also render?

From `client.ts` remove in `GameState`

    visuals: { [key: string]: VisualItem };

and in `_localGame` and `_remoteGame` remove

    visuals: {},

In `function handleServerMessage(msg: any)` remove

    _localGame.visuals = unionLastWriterWins(
        _localGame.visuals,
        _remoteGame.visuals
    );

In `function render()` remove

    visualsRender(_localGame, _computed);

Remove `visual.ts`.

In `interface TurnableItem` in `turnable.ts` change

    sides: string[];

to

    images: string[];
    colors: string[];
    cssClass: string[];
