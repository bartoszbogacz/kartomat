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
  privateAreas: { [key: string]: ReplicatedPrivateArea };
}

class Scene {
  private replica: ReplicatedScene;
  private privateAreas: { [key: string]: PrivateArea } = {};
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
      privateAreas: {},
    };
  }

  get tick(): number {
    return this.replica.tick;
  }

  get playerId(): string {
    return this.replica.playerId;
  }

  synchronizeWith(remote: ReplicatedScene) {
    this.cardsOnDeck = {};

    for (const [key, item] of Object.entries(remote.privateAreas)) {
      if (!this.privateAreas.hasOwnProperty(key)) {
        this.privateAreas[key] = new PrivateArea(this, key);
      }
      this.privateAreas[key].synchronizeWith(item);
    }

    for (const [key, item] of Object.entries(remote.cards)) {
      if (!this.cards.hasOwnProperty(key)) {
        this.cards[key] = new Card(this, key);
      }

      this.cards[key].synchronizeWith(item);

      if (item.onDeck !== null) {
        if (this.cardsOnDeck.hasOwnProperty(item.onDeck)) {
          this.cardsOnDeck[item.onDeck].push(this.cards[key]);
        } else {
          this.cardsOnDeck[item.onDeck] = [this.cards[key]];
        }
      }
    }

    for (const [key, item] of Object.entries(remote.decks)) {
      if (!this.decks.hasOwnProperty(key)) {
        this.decks[key] = new Deck(this, key, null);
      }
      this.decks[key].synchronizeWith(item);
    }
  }

  render() {
    for (const [deckId, deck] of Object.entries(this.decks)) {
      deck.render(0, this.cardsOnDeck[deckId]);
    }
  }

  createDeck(ref: Card): Deck {
    for (let i = 0; i < 1000; i++) {
      const name = "deck" + i;
      if (!this.decks.hasOwnProperty(name)) {
        return new Deck(this, name, ref);
      }
    }

    throw new Error("Ids for decks exhausted.");
  }

  topZOfCards(): number {
    let z: number = 0;

    for (const [cardId, card] of Object.entries(this.cards)) {
      if (card.z > z) {
        z = card.z;
      }
    }

    return z;
  }

  pixelsOverlap(a: Card, b: Card | PrivateArea): number {
    const h = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const v = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return Math.max(0, h) * Math.max(0, v);
  }

  overlapsPrivateArea(card: Card): PrivateArea | null {
    for (const [areaId, area] of Object.entries(this.privateAreas)) {
      if (this.pixelsOverlap(card, area) > 0) {
        return area;
      }
    }

    return null;
  }

  overlapsCard(card: Card): Card | null {
    let largest: Card | null = null;
    let pixels: number = 500;

    for (const [otherId, other] of Object.entries(this.cards)) {
      if (other === card) {
        continue;
      }

      const priv = this.overlapsPrivateArea(other);
      const area = this.pixelsOverlap(card, other);
      const ownsOther = other.owner === card.owner;

      if (area > pixels && ((priv && ownsOther) || !priv)) {
        pixels = area;
        largest = other;
      }
    }

    return largest;
  }
}
