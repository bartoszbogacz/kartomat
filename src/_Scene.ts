interface Rectangle {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

interface ReplicatedScene {
  tick: number;
  gameId: string;
  playerId: string;
  clientId: string;

  boards: { [key: string]: ReplicatedBoard };
  marbles: { [key: string]: ReplicatedMarble };
  avatars: { [key: string]: ReplicatedAvatar };
  notepads: { [key: string]: ReplicatedNotepad };
  cards: { [key: string]: ReplicatedCard };
  decks: { [key: string]: ReplicatedDeck };
  privateareas: { [key: string]: ReplicatedPrivateArea };
}

class Scene {
  private replica: ReplicatedScene;
  private cards: { [key: string]: Card } = {};
  private decks: { [key: string]: Deck } = {};
  private cardsOnDeck: { [key: string]: Card[] } = {};

  constructor() {
    this.replica = {
      tick: 0,
      gameId: "",
      playerId: "",
      clientId: "",
      boards: {},
      marbles: {},
      avatars: {},
      notepads: {},
      cards: {},
      decks: {},
      privateareas: {},
    };
  }

  get tick(): number {
    return this.replica.tick;
  }

  get playerId(): string {
    return this.replica.playerId;
  }

  update() {
    this.cardsOnDeck = {};

    for (const [cardId, card] of Object.entries(this.replica.cards)) {
      if (this.cards.hasOwnProperty(cardId)) {
        this.cards[cardId].update();
      } else {
        this.cards[cardId] = new Card(this, cardId, card);
      }

      if (card.onDeck !== null) {
        if (this.cardsOnDeck.hasOwnProperty(card.onDeck)) {
          this.cardsOnDeck[card.onDeck].push(this.cards[cardId]);
        } else {
          this.cardsOnDeck[card.onDeck] = [this.cards[cardId]];
        }
      }
    }

    for (const [deckId, deck] of Object.entries(this.replica.decks)) {
      if (this.cards.hasOwnProperty(deckId)) {
        this.decks[deckId].update();
      } else {
        this.decks[deckId] = new Deck(this, deckId, deck);
      }
    }
  }

  render() {
    for (const [deckId, deck] of Object.entries(this.decks)) {
      deck.render(0, this.cardsOnDeck[deckId]);
    }
  }

  createDeck(): Deck {
    return new Deck(this, "", null);
  }

  topZOfCardsAndDecks(): number {
    let z: number = 0;

    for (const [cardId, card] of Object.entries(this.cards)) {
      if (card.rect.z > z) {
        z = card.rect.z;
      }
    }

    return z;
  }

  largestOverlapWithCard(card: Card): Card | null {
    return null;
  }
}
