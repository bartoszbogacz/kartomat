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
  private remoteTick: number = 0;
  private replica: ReplicatedScene;

  private avatars: { [key: string]: Avatar } = {};
  private boards: { [key: string]: Board } = {};
  private marbles: { [key: string]: Marble } = {};
  private notepads: { [key: string]: Notepad } = {};
  private privateAreas: { [key: string]: PrivateArea } = {};
  private decks: { [key: string]: Deck } = {};
  private cards: { [key: string]: Card } = {};

  private cardsOnDeck: { [key: string]: Card[] } = {};

  constructor() {
    this.replica = {
      tick: 0,
      boardId: "",
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

  get boardId(): string {
    return this.replica.boardId;
  }

  set boardId(value: string) {
    this.replica.boardId = value;
  }

  get gameId(): string {
    return this.replica.gameId;
  }

  set gameId(value: string) {
    this.replica.gameId = value;
  }

  get playerId(): string {
    return this.replica.playerId;
  }

  set playerId(value: string) {
    this.replica.playerId = value;
  }

  get clientId(): string {
    return this.replica.clientId;
  }

  /** Apply changes from remote. Takes ownership of the argument. */
  synchronizeWith(remote: ReplicatedScene) {
    // Never regress tick even if server tells us so. Otherwise we may
    // not be able to change our own objects if their tick is higher than
    // ours. Client tick and server tick behave like Lamport timestamp.
    this.remoteTick = remote.tick;
    this.replica.tick = Math.max(this.replica.tick, remote.tick);

    // Take over settings from server
    this.replica.boardId = remote.boardId;
    this.replica.gameId = remote.gameId;
    this.replica.playerId = remote.playerId;
    this.replica.clientId = remote.clientId;

    for (const [key, avatar] of Object.entries(remote.avatars)) {
      if (!this.avatars.hasOwnProperty(key)) {
        this.avatars[key] = new Avatar(this, key);
      }
      this.avatars[key].synchronizeWith(avatar);
    }

    for (const [key, marble] of Object.entries(remote.marbles)) {
      if (!this.marbles.hasOwnProperty(key)) {
        this.marbles[key] = new Marble(this, key);
      }
      this.marbles[key].synchronizeWith(marble);
    }

    for (const [key, board] of Object.entries(remote.boards)) {
      if (!this.boards.hasOwnProperty(key)) {
        this.boards[key] = new Board(this, key);
      }
      this.boards[key].synchronizeWith(board);
    }

    for (const [key, notepad] of Object.entries(remote.notepads)) {
      if (!this.notepads.hasOwnProperty(key)) {
        this.notepads[key] = new Notepad(this, key);
      }
      this.notepads[key].synchronizeWith(notepad);
    }

    for (const [key, privateArea] of Object.entries(remote.privateAreas)) {
      if (!this.privateAreas.hasOwnProperty(key)) {
        this.privateAreas[key] = new PrivateArea(this, key);
      }
      this.privateAreas[key].synchronizeWith(privateArea);
    }

    for (const [key, deck] of Object.entries(remote.decks)) {
      if (!this.decks.hasOwnProperty(key)) {
        this.decks[key] = new Deck(this, key, null);
      }
      this.decks[key].synchronizeWith(deck);
    }

    this.cardsOnDeck = {};

    for (const [key, card] of Object.entries(remote.cards)) {
      if (!this.cards.hasOwnProperty(key)) {
        this.cards[key] = new Card(this, key);
      }

      this.cards[key].synchronizeWith(card);

      if (card.onDeck !== null) {
        if (this.cardsOnDeck.hasOwnProperty(card.onDeck)) {
          this.cardsOnDeck[card.onDeck].push(this.cards[key]);
        } else {
          this.cardsOnDeck[card.onDeck] = [this.cards[key]];
        }
      }
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

    for (const [key, avatar] of Object.entries(this.replica.avatars)) {
      if (avatar.tick > this.remoteTick) {
        result.avatars[key] = avatar;
      }
    }

    for (const [key, board] of Object.entries(this.replica.boards)) {
      if (board.tick > this.remoteTick) {
        result.boards[key] = board;
      }
    }

    for (const [key, marble] of Object.entries(this.replica.marbles)) {
      if (marble.tick > this.remoteTick) {
        result.marbles[key] = marble;
      }
    }

    for (const [key, notepad] of Object.entries(this.replica.notepads)) {
      if (notepad.tick > this.remoteTick) {
        result.notepads[key] = notepad;
      }
    }

    for (const [key, privateArea] of Object.entries(
      this.replica.privateAreas
    )) {
      if (privateArea.tick > this.remoteTick) {
        result.privateAreas[key] = privateArea;
      }
    }

    for (const [key, deck] of Object.entries(this.replica.decks)) {
      if (deck.tick > this.remoteTick) {
        result.decks[key] = deck;
      }
    }

    for (const [key, card] of Object.entries(this.replica.cards)) {
      if (card.tick > this.remoteTick) {
        result.cards[key] = card;
      }
    }

    return result;
  }

  render() {
    let z: number = 0;

    for (const [key, avatar] of Object.entries(this.avatars)) {
      z = avatar.render(z);
    }

    for (const [key, marble] of Object.entries(this.marbles)) {
      z = marble.render(z);
    }

    for (const [key, board] of Object.entries(this.boards)) {
      z = board.render(z);
    }

    for (const [key, notepad] of Object.entries(this.notepads)) {
      z = notepad.render(z);
    }

    for (const [key, privateArea] of Object.entries(this.privateAreas)) {
      z = privateArea.render(z);
    }

    for (const [key, deck] of Object.entries(this.decks)) {
      z = deck.render(z, this.cardsOnDeck[key]);
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

  pixelsOverlap(a: Card | Deck, b: Card | PrivateArea): number {
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

  overlapsCard(card: Card | Deck): Card | null {
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
