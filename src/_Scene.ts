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
  public tick: number = 0;
  public boardId: string = "";
  public gameId: string = "";
  public playerId: string = "";
  public clientId: string = "";

  // Last seen tick from server
  private remoteTick: number = 0;

  // Scene graph derived from replicated state
  private avatars: { [key: string]: Avatar } = {};
  private boards: { [key: string]: Board } = {};
  private marbles: { [key: string]: Marble } = {};
  private notepads: { [key: string]: Notepad } = {};
  private privateAreas: { [key: string]: PrivateArea } = {};
  private decks: { [key: string]: Deck } = {};
  private cards: { [key: string]: Card } = {};

  // Computed properties
  private cardsOnDeck: { [key: string]: Card[] } = {};

  constructor() {
    //
  }

  /** Apply changes from remote. Takes ownership of the argument. */
  synchronizeWith(remote: ReplicatedScene) {
    // Last known tick from server informs which changes happened
    this.remoteTick = remote.tick;

    // Never regress tick even if server tells us so. Otherwise we may
    // not be able to change our own objects if their tick is higher than
    // ours. Client tick and server tick behave like a Lamport timestamp.
    this.tick = Math.max(this.tick, remote.tick);

    // Take over settings from server
    this.boardId = remote.boardId;
    this.gameId = remote.gameId;
    this.playerId = remote.playerId;
    this.clientId = remote.clientId;

    // Order elements
    let z: number = 0;

    for (const [key, board] of Object.entries(remote.boards)) {
      if (!this.boards.hasOwnProperty(key)) {
        this.boards[key] = new Board(key, board, this);
        this.boards[key].synchronize();
      }
      if (board.tick > this.boards[key].replica.tick) {
        this.boards[key].z = z;
        this.boards[key].replica = board;
        this.boards[key].synchronize();
      }
      z = z + this.boards[key].d;
    }

    for (const [key, notepad] of Object.entries(remote.notepads)) {
      if (!this.notepads.hasOwnProperty(key)) {
        this.notepads[key] = new Notepad(key, notepad, this);
        this.notepads[key].synchronize();
      }
      if (notepad.tick > this.notepads[key].replica.tick) {
        this.notepads[key].z = z;
        this.notepads[key].replica = notepad;
        this.notepads[key].synchronize();
      }
      z = z + this.notepads[key].d;
    }

    for (const [key, avatar] of Object.entries(remote.avatars)) {
      if (!this.avatars.hasOwnProperty(key)) {
        this.avatars[key] = new Avatar(key, avatar, this);
        this.avatars[key].synchronize();
      }
      if (avatar.tick > this.avatars[key].replica.tick) {
        this.avatars[key].z = z;
        this.avatars[key].replica = avatar;
        this.avatars[key].synchronize();
      }
      z = z + this.avatars[key].d;
    }

    for (const [key, privateArea] of Object.entries(remote.privateAreas)) {
      if (!this.privateAreas.hasOwnProperty(key)) {
        this.privateAreas[key] = new PrivateArea(key, privateArea, this);
        this.privateAreas[key].synchronize();
      }
      if (privateArea.tick > this.privateAreas[key].replica.tick) {
        this.privateAreas[key].z = z;
        this.privateAreas[key].replica = privateArea;
        this.privateAreas[key].synchronize();
      }
      z = z + this.privateAreas[key].d;
    }

    for (const [key, card] of Object.entries(remote.cards)) {
      if (!this.cards.hasOwnProperty(key)) {
        this.cards[key] = new Card(key, card, this);
        this.cards[key].synchronize();
      }
      if (card.tick > this.cards[key].replica.tick) {
        this.cards[key].z = z;
        this.cards[key].replica = card;
        this.cards[key].synchronize();
      }
      z = z + this.cards[key].d;
    }

    // Re-compute card assignments
    // TODO: Only do this for cards that actually changed.

    this.cardsOnDeck = {};

    for (const [key, card] of Object.entries(this.cards)) {
      if (card.replica.onDeck !== null) {
        if (this.cardsOnDeck.hasOwnProperty(card.replica.onDeck)) {
          this.cardsOnDeck[card.replica.onDeck].push(this.cards[key]);
        } else {
          this.cardsOnDeck[card.replica.onDeck] = [this.cards[key]];
        }
      }
    }

    for (const [key, deck] of Object.entries(remote.decks)) {
      if (!this.decks.hasOwnProperty(key)) {
        this.decks[key] = new Deck(key, deck, this);
        this.decks[key].synchronize();
      }
      if (deck.tick > this.decks[key].replica.tick) {
        this.decks[key].z = z;
        this.decks[key].replica = deck;
        this.decks[key].cards = this.cardsOnDeck[key];
        this.decks[key].synchronize();
      }
      z = z + this.decks[key].d;
    }

    for (const [key, marble] of Object.entries(remote.marbles)) {
      if (!this.marbles.hasOwnProperty(key)) {
        this.marbles[key] = new Marble(key, marble, this);
        this.marbles[key].synchronize();
      }
      if (marble.tick > this.marbles[key].replica.tick) {
        this.marbles[key].z = z;
        this.marbles[key].replica = marble;
        this.marbles[key].synchronize();
      }
      z = z + this.marbles[key].d;
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

    for (const [key, avatar] of Object.entries(this.avatars)) {
      if (avatar.replica.tick > this.remoteTick) {
        result.avatars[key] = avatar.replica;
      }
    }

    for (const [key, board] of Object.entries(this.boards)) {
      if (board.replica.tick > this.remoteTick) {
        result.boards[key] = board.replica;
      }
    }

    for (const [key, marble] of Object.entries(this.marbles)) {
      if (marble.replica.tick > this.remoteTick) {
        result.marbles[key] = marble.replica;
      }
    }

    for (const [key, notepad] of Object.entries(this.notepads)) {
      if (notepad.replica.tick > this.remoteTick) {
        result.notepads[key] = notepad.replica;
      }
    }

    for (const [key, privateArea] of Object.entries(this.privateAreas)) {
      if (privateArea.replica.tick > this.remoteTick) {
        result.privateAreas[key] = privateArea.replica;
      }
    }

    for (const [key, deck] of Object.entries(this.decks)) {
      if (deck.replica.tick > this.remoteTick) {
        result.decks[key] = deck.replica;
      }
    }

    for (const [key, card] of Object.entries(this.cards)) {
      if (card.replica.tick > this.remoteTick) {
        result.cards[key] = card.replica;
      }
    }

    return result;
  }

  render() {
    for (const [key, board] of Object.entries(this.boards)) {
      board.render();
    }

    for (const [key, notepad] of Object.entries(this.notepads)) {
      notepad.render();
    }

    for (const [key, avatar] of Object.entries(this.avatars)) {
      avatar.render();
    }

    for (const [key, marble] of Object.entries(this.marbles)) {
      marble.render();
    }

    for (const [key, privateArea] of Object.entries(this.privateAreas)) {
      privateArea.render();
    }

    for (const [key, deck] of Object.entries(this.decks)) {
      deck.render();
    }

    for (const [key, card] of Object.entries(this.cards)) {
      card.render();
    }
  }

  createDeck(ref: Card): Deck {
    for (let i = 0; i < 1000; i++) {
      const name = "deck" + i;
      if (!this.decks.hasOwnProperty(name)) {
        const replica: ReplicatedDeck = {
          tick: this.tick,
          owner: this.playerId,
          x: ref.x - 30,
          y: ref.y,
          z: ref.z,
          w: ref.w,
          h: ref.h,
          strides: [0, 20],
          current: 0,
        };
        return new Deck(name, replica, this);
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
      const ownsOther = other.replica.owner === card.replica.owner;

      if (area > pixels && ((priv && ownsOther) || !priv)) {
        pixels = area;
        largest = other;
      }
    }

    return largest;
  }
}
