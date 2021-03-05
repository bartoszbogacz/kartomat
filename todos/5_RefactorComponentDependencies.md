# Refactor Component Dependencies

Components must not be allowed to modify state. Otherwise their order of
invokation is relevant and effects cannot be exactly assigned whether they
are displayed on this tick or on the next tick. Compare for example, the
notice in client.ts/render

    // This order is important. It should be
    // loc1, strat, stack, loc2. Computes
    // in-between are fine.
    // FIXME: locatablesCompute2 needs to be called twice,
    // since stackingsCreateNew may add new ones on button
    // presses and these need to be available by stratifersCompute
    // and than again, based on the dividers again for button
    // presses

Rendering depends on order. Since some elements want to create their
own elements instead of relying on Locatable. But then, they do not want
to be responsible for actual placement logic. Compare for example,
Avatar, Writeable, and Stacking.

Also:

    // Both Locatable and Avatar want to create an element for their
    // entitiy. We schedule avatarsRender to be called earlier than
    // locatablesRender so that Avatar gets priority to create a
    // textarea instead of a div element in locatablesRender. After
    // an element was create the explicit check prevents it from being
    // re-created. The same is the case for Writeables and Stackings.
    // This is admittably less than elegant and implements an unspecified
    // ad-hoc inheritance structure. For now, it does afford a way of
    // specialization, however.

## Goals

Remove any `throw new Error("Locations not yet computed.");`.
Enfore inter-component dependencies using the type system.

## Structrue

Classes that only contain state that is replicated among all peers.

`tickLocal` denote the last update to the element. If `tickLocal > tick`
changes to this element need to send to peers.

    class GameSceneReplicated { pieces }

    class GamingPieceReplicated { tick, ownedBy, tickLocal, x, y, w, h, l, z }

    class PlayingBoardReplicated extends GamingPieceReplicated { image }

    class PlayerAvatarReplicated extends GameingPieceReplicted { text, represents }

    class PrivateAreaReplicated extends GameingPieceReplicated { }

    class WritingSurface extends GameingPieceReplicated { text }

    class MovablePieceReplicated extends GamingPieceReplicated { }

    class PlayingMarbleReplicated extends MovablePieceReplicated { color }

    class PlayingCardReplicated extends MovablePieceReplicated { images, current, onStack }

    class PlayingDeckReplicated extends MoveablePieceReplicated { }

Classes that derive properties local for each client related to visualization.
Only leaf classes of the hierarchy of replicated classes are extended.
Then, only properties that need deriving are shadowed. For example, all
z values need to be re-computed since for visualization we are intersted
in their rank and not the actual position. The same is true for the
cards in a stack. While only their fractional index x and their stacking
is shared, for visualization their rank on their current stacking determines
the position of a card.

`tickVisible` denotes the last rendered tick. If `tickLocal > tickVisible` the element
needs to be re-rendered.

    class GameScene extends GameSceneReplicated { pieces }

    class PlayingBoard extends PlayingBoardReplicated { tickVisible, z, elem }

    class PlayerAvatar extends PlayerAvatarReplicated { tickVisible, z, elem }

    class PrivateArea extends PrivateAreaReplicated { tickVisible, elem, visibleToAll, visibleToSelfOnly, visisbleToOthersOnly }

    class WritingSurface extends WritingSurfaceReplicated { tickVisible, z, elem }

    class PlayingMarble extends PlayingMarbleReplicated { tickVisible, z, color, elem }

    class PlayingCard extends PlayingCardReplicated { tickVisible, x, y, z, images, current, onStack, elem }

    class PlayingDeck extends PlayingDeckReplicated { tickVisible, z, elem, cards }

Additionally there is scene tree.

    GameScene
        PlayingMarble
        WritingSurface
        [...]
        PrivateArea
            visibleToAll
                GamingPieceReplicated
                [...]
                PlayingCard
                [...]
                PlayingDeck
                    PlayingCard
                    [...]
            visisbleToSelfOnly
                [...]
            visibleToOthersOnly
                [...]

## Information propagation

    GameScene.synchronize()

    GameScene.compute()

    GameScene.render()
