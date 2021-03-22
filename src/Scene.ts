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
  public playerName: string = "";
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
  public representingAvatar: Avatar | null = null;

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

    // TODO: Use card and deck-like constructor for all items

    for (const [key, replica] of Object.entries(remote.boards)) {
      let item = this.boards[key];
      if (item === undefined) {
        item = new Board(key, replica, this);
        this.boards[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.notepads)) {
      let item = this.notepads[key];
      if (item === undefined) {
        item = new Notepad(key, replica, this);
        this.notepads[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.avatars)) {
      let item = this.avatars[key];
      if (item === undefined) {
        item = new Avatar(key, replica, this);
        this.avatars[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.privateAreas)) {
      let item = this.privateAreas[key];
      if (item === undefined) {
        item = new PrivateArea(key, replica, this);
        this.privateAreas[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.cards)) {
      let item = this.cards[key];
      if (item === undefined) {
        item = new Card(key, replica, this);
        this.cards[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.decks)) {
      let item = this.decks[key];
      if (item === undefined) {
        item = new Deck(key, replica, this);
        this.decks[key] = item;
      }
      item.synchronize(replica);
    }

    for (const [key, replica] of Object.entries(remote.marbles)) {
      let item = this.marbles[key];
      if (item === undefined) {
        item = new Marble(key, replica, this);
        this.marbles[key] = item;
      }
      item.synchronize(replica);
    }

    // Compute dependant properties

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

    // Find and/or assign an avatar to the player

    if (this.representingAvatar === null) {
      for (const [key, avatar] of Object.entries(this.avatars)) {
        if (
          avatar.replica.represents === null ||
          avatar.replica.represents === this.playerId
        ) {
          this.representingAvatar = avatar;
          avatar.replica.tick = this.tick;
          avatar.replica.owner = this.playerId;
          avatar.replica.represents = this.playerId;
          if (this.playerName === "") {
            this.playerName = avatar.replica.text;
          } else {
            avatar.replica.text = this.playerName;
          }
          break;
        }
      }
    } else {
      this.playerName = this.representingAvatar.replica.text;
    }
  }

  layout() {
    window.requestAnimationFrame(this._layout.bind(this));
  }

  private _layout(this: Scene) {
    for (const [key, item] of Object.entries(this.boards)) {
      item.layoutByScene(0);
    }

    for (const [key, item] of Object.entries(this.notepads)) {
      item.layoutByScene(1);
    }

    for (const [key, item] of Object.entries(this.avatars)) {
      item.layoutByScene(10);
    }

    for (const [key, item] of Object.entries(this.privateAreas)) {
      item.layoutByScene(100);
    }

    for (const [key, item] of Object.entries(this.decks)) {
      item.layoutByScene(20000);
    }

    for (const [key, item] of Object.entries(this.cards)) {
      item.layoutByScene(20000);
    }

    for (const [key, item] of Object.entries(this.marbles)) {
      item.layoutByScene(30000);
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
      const changes = item.changes();
      if (changes !== null) {
        result.avatars[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.boards)) {
      const changes = item.changes();
      if (changes !== null) {
        result.boards[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.marbles)) {
      const changes = item.changes();
      if (changes !== null) {
        result.marbles[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.notepads)) {
      const changes = item.changes();
      if (changes !== null) {
        result.notepads[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.privateAreas)) {
      const changes = item.changes();
      if (changes !== null) {
        result.privateAreas[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.decks)) {
      const changes = item.changes();
      if (changes !== null) {
        result.decks[key] = changes;
      }
    }

    for (const [key, item] of Object.entries(this.cards)) {
      const changes = item.changes();
      if (changes !== null) {
        result.cards[key] = changes;
      }
    }

    return result;
  }

  createDeck(ref: Card): Deck {
    for (let i = 0; i < 1000; i++) {
      const key = "deck" + i;
      if (!this.decks.hasOwnProperty(key)) {
        const deck = Deck.fromCard(key, ref, this);
        this.decks[key] = deck;
        return deck;
      }
    }
    throw new Error("Ids for decks exhausted.");
  }

  topZ(): number {
    let z: number = 0;

    // TODO: Items themselves should say how much z space they
    // require, however, statically just as it is now.

    for (const [cardId, deck] of Object.entries(this.decks)) {
      if (deck.replica.z + 100 > z) {
        z = deck.replica.z + 100;
      }
    }

    for (const [cardId, card] of Object.entries(this.cards)) {
      if (card.replica.z > z) {
        z = card.replica.z;
      }
    }

    for (const [cardId, marble] of Object.entries(this.marbles)) {
      if (marble.replica.z > z) {
        z = marble.replica.z;
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
