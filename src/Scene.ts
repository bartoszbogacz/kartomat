interface ReplicatedScene {
  tick: number;
  boardId: string;
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
  /** Replicated game properties */
  public tick: number = 0;
  public boardId: string = "";
  public gameId: string = "";
  public playerId: string = "";
  public clientId: string = "";

  /** Scene graph */
  public avatars: { [key: string]: Avatar } = {};
  public boards: { [key: string]: Board } = {};
  public marbles: { [key: string]: Marble } = {};
  public notepads: { [key: string]: Notepad } = {};
  public privateAreas: { [key: string]: PrivateArea } = {};
  public decks: { [key: string]: Deck } = {};
  public cards: { [key: string]: Card } = {};

  /** Computed properties */
  public cardsOnDeck: { [key: string]: Card[] } = {};

  constructor() {
    //
  }

  /** Distribute changes from remote */
  synchronize(remote: ReplicatedScene) {
    // Never regress tick even if server tells us so. Otherwise we may
    // not be able to change our own objects if their tick is higher than
    // ours. Client tick and server tick behave like a Lamport timestamp.
    this.tick = Math.max(this.tick, remote.tick);

    // Take over settings from server
    this.boardId = remote.boardId;
    this.gameId = remote.gameId;
    this.playerId = remote.playerId;
    this.clientId = remote.clientId;

    // Propagate changes to itmes

    for (const [key, replica] of Object.entries(remote.boards)) {
      const item = this.boards[key];
      if (item === undefined) {
        this.boards[key] = new Board(key, replica, this);
      } else {
        item.synchronize(replica);
      }
    }

    for (const [key, replica] of Object.entries(remote.notepads)) {
      const item = this.notepads[key];
      if (item === undefined) {
        this.notepads[key] = new Notepad(key, replica, this);
      } else {
        item.synchronize(replica);
      }
    }

    for (const [key, replica] of Object.entries(remote.avatars)) {
      const item = this.avatars[key];
      if (item === undefined) {
        this.avatars[key] = new Avatar(key, replica, this);
      } else {
        item.synchronize(replica);
      }
    }

    for (const [key, replica] of Object.entries(remote.privateAreas)) {
      const item = this.privateAreas[key];
      if (item === undefined) {
        this.privateAreas[key] = new PrivateArea(key, replica, this);
      } else {
        item.synchronize(replica);
      }
    }

    // TODO: Use card and deck-like constructor for all items
    // Neccessitates to use card and deck-like check for all items.

    for (const [key, replica] of Object.entries(remote.cards)) {
      let item = this.cards[key];
      if (item === undefined) {
        item = new Card(key, this);
        this.cards[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.decks)) {
      let item = this.decks[key];
      if (item === undefined) {
        item = new Deck(key, this);
        this.decks[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.marbles)) {
      const item = this.marbles[key];
      if (item === undefined) {
        this.marbles[key] = new Marble(key, replica, this);
      } else {
        item.synchronize(replica);
      }
    }
  }

  /** Re-compute properties dependent on replicas */
  render() {
    window.requestAnimationFrame(this._render.bind(this));
  }

  private _render(this: Scene) {
    this.cardsOnDeck = {};

    for (const [key, deck] of Object.entries(this.decks)) {
      this.cardsOnDeck[key] = [];
    }

    for (const [key, card] of Object.entries(this.cards)) {
      if (card.replica.onDeck !== null) {
        const cards = this.cardsOnDeck[card.replica.onDeck];
        if (cards) {
          cards.push(card);
        }
      }
    }

    for (const [key, item] of Object.entries(this.boards)) {
      item.render(100);
    }

    for (const [key, item] of Object.entries(this.notepads)) {
      item.render(200);
    }

    for (const [key, item] of Object.entries(this.avatars)) {
      item.render(300);
    }

    for (const [key, item] of Object.entries(this.marbles)) {
      item.render(400);
    }

    for (const [key, item] of Object.entries(this.privateAreas)) {
      item.render(500);
    }

    for (const [key, item] of Object.entries(this.decks)) {
      item.render(600);
    }

    for (const [key, item] of Object.entries(this.cards)) {
      item.render(700);
    }
  }

  differences(): ReplicatedScene {
    const result: ReplicatedScene = {
      tick: this.tick,
      boardId: this.boardId,
      gameId: this.gameId,
      playerId: this.playerId,
      clientId: this.clientId,
      avatars: {},
      boards: {},
      marbles: {},
      notepads: {},
      privateAreas: {},
      decks: {},
      cards: {},
    };

    for (const [key, item] of Object.entries(this.avatars)) {
      const changed = item.changed();
      if (changed !== null) {
        result.avatars[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.boards)) {
      const changed = item.changed();
      if (changed !== null) {
        result.boards[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.marbles)) {
      const changed = item.changed();
      if (changed !== null) {
        result.marbles[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.notepads)) {
      const changed = item.changed();
      if (changed !== null) {
        result.notepads[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.privateAreas)) {
      const changed = item.changed();
      if (changed !== null) {
        result.privateAreas[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.decks)) {
      const changed = item.changed();
      if (changed !== null) {
        result.decks[key] = changed;
      }
    }

    for (const [key, item] of Object.entries(this.cards)) {
      const changed = item.changed();
      if (changed !== null) {
        result.cards[key] = changed;
      }
    }

    return result;
  }

  createDeck(ref: Card): Deck {
    for (let i = 0; i < 1000; i++) {
      const key = "deck" + i;
      if (!this.decks.hasOwnProperty(key)) {
        const deck = new Deck(key, this);
        deck.orientate(ref);
        this.decks[key] = deck;
        return deck;
      }
    }
    throw new Error("Ids for decks exhausted.");
  }

  topZOfCards(): number {
    let z: number = 0;

    for (const [cardId, card] of Object.entries(this.cards)) {
      if (card.replica.z > z) {
        z = card.replica.z;
      }
    }

    return z;
  }

  pixelsOverlap(a: Card | Deck, b: Card | PrivateArea): number {
    const h =
      Math.min(a.box.x + a.box.w, b.box.x + b.box.w) -
      Math.max(a.box.x, b.box.x);
    const v =
      Math.min(a.box.y + a.box.h, b.box.y + b.box.h) -
      Math.max(a.box.y, b.box.y);
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

  overlapsCard(card: Card | Deck): Card | null {
    let largest: Card | null = null;
    let pixels: number = 500;

    for (const [otherId, other] of Object.entries(this.cards)) {
      if (other === card) {
        continue;
      }

      const priv = this.overlapsPrivateArea(other);
      const area = this.pixelsOverlap(card, other);
      const ownsOther = other.replica.owner === card.replica.owner;

      if (area > pixels && ((priv && ownsOther) || !priv)) {
        pixels = area;
        largest = other;
      }
    }

    return largest;
  }
}
