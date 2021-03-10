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
Enforce inter-component dependencies using the type system.

## Examples

    class SceneReplicated {
        tick: number;
        gameId: string;
        gameName: string;
        boardId: string;
        boardName: string;
    }

    class Scene {
        replica: SceneReplicated;

        playerId: string;
        clientId: string;

        playerName: string;
    }

    class Scene {
        render() {
            let decks = {};
            for (const piece of this.pieces) {
                if (piece.name.startswith("card")) {
                    decks[piece.deck].push(piece);
                }
            }

            for (const [deckName, cards] of Object.entries(decks)) {
                this.pieces[deckName].render(cards)
            }
        }
    }

    class Deck {
        render(cards: Card[]) {
            this.cards = cards;

            for (let i = 0; i < this.cards.length; i++) {
                this.cards[i].render(
                    this.x + this.w + this.replica.stride * i,
                    this.y
                );
            }
        }
    }

    class CardReplicated {
        tick: number;
        owner: (string | null);
        x: number;
        y: number;
        w: number;
        h: number;
        l: number;
        z: number;
        deck: string;
        sides: string[];
        current: number;

        update (x: number, y: number, z: number, deck: (string | null)) {
            //
        }
    }

    class Card {
        replica: CardReplicated;
        scene: Scene;
        deck: Deck;
        elem: DOMElement;

        x: number;
        y: number;

        render(x: number, y: number) {
            this.x = x;
            this.y = y;

            this.elem.style.left = this.x + "px";
            this.elem.style.top = this.y + "px";
        }

        take() {
            this.replica.update(
                this.deck.x + this.x,
                this.deck.y + this.y,
                this.scene.topZ() + 1,
                null
            )
        }

        place() {
            deck = this.scene.largestOverlapsDecks(this);
            if (deck !== null) {
                this.replica.update(deck.fractionalIndexAt(this.x), this.y, this.z, deck);
                return;
            }

            piece = this.scene.largestOverlapsCards(this);
            if (piece !== null) {
                const deckName: string = scene.newDeck(this.x, this.y, this.z);
                this.replica.update(this.x, this.y, this.z, deck);
                piece.replica.update(piece.x, piece.y, piece.z, deck);
                return;
            }
        }
    }
