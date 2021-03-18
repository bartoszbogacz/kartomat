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

  /** Computed properties */
  public cardsOnDeck: { [key: string]: Card[] } = {};

  // Scene graph derived from replicated state
  private avatars: { [key: string]: Avatar } = {};
  private boards: { [key: string]: Board } = {};
  private marbles: { [key: string]: Marble } = {};
  private notepads: { [key: string]: Notepad } = {};
  private privateAreas: { [key: string]: PrivateArea } = {};
  private decks: { [key: string]: Deck } = {};
  private cards: { [key: string]: Card } = {};

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

    for (const [key, item] of Object.entries(remote.boards)) {
      if (!this.boards.hasOwnProperty(key)) {
        this.boards[key] = new Board(key, item, this);
      }
      this.boards[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.notepads)) {
      if (!this.notepads.hasOwnProperty(key)) {
        this.notepads[key] = new Notepad(key, item, this);
      }
      this.notepads[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.avatars)) {
      if (!this.avatars.hasOwnProperty(key)) {
        this.avatars[key] = new Avatar(key, item, this);
      }
      this.avatars[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.privateAreas)) {
      if (!this.privateAreas.hasOwnProperty(key)) {
        this.privateAreas[key] = new PrivateArea(key, item, this);
      }
      this.privateAreas[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.cards)) {
      if (!this.cards.hasOwnProperty(key)) {
        this.cards[key] = new Card(key, item, this);
      }
      this.cards[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.decks)) {
      if (!this.decks.hasOwnProperty(key)) {
        this.decks[key] = new Deck(key, item, this);
      }
      this.decks[key].synchronize(item);
    }

    for (const [key, item] of Object.entries(remote.marbles)) {
      if (!this.marbles.hasOwnProperty(key)) {
        this.marbles[key] = new Marble(key, item, this);
      }
      this.marbles[key].synchronize(item);
    }
  }

  /** Re-compute properties dependent on replicas */
  render() {
    window.requestAnimationFrame(this._render.bind(this));
  }

  private _render(this: Scene) {
    this.cardsOnDeck = {};

    for (const [key, card] of Object.entries(this.cards)) {
      if (card.onDeck !== null) {
        if (this.cardsOnDeck.hasOwnProperty(card.onDeck.key)) {
          this.cardsOnDeck[card.onDeck.key].push(this.cards[key]);
        } else {
          this.cardsOnDeck[card.onDeck.key] = [this.cards[key]];
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
      const name = "deck" + i;
      if (!this.decks.hasOwnProperty(name)) {
        const replica: ReplicatedDeck = {
          tick: this.tick,
          owner: this.playerId,
          x: ref.box.x - 30,
          y: ref.box.y,
          z: ref.box.z,
          w: ref.box.w,
          h: ref.box.h,
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
      if (card.box.z > z) {
        z = card.box.z;
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
