interface ReplicatedDeck {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  strides: number[];
  current: number;
}

class Deck {
  private _name: string;
  private _z: number = 0;

  private stride: number = 10;
  private cards: Card[] = [];

  private replica: ReplicatedDeck = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 30,
    h: 150,
    strides: [2, 10],
    current: 0,
  };

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(scene: Scene, name: string, ref: Card | null) {
    this._name = name;
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);

    this.ownerElem = document.createElement("div");
    this.ownerElem.style.position = "absolute";
    this.ownerElem.style.userSelect = "none";
    document.body.appendChild(this.ownerElem);

    if (ref !== null) {
      this.replica.tick = ref.tick;
      this.replica.owner = ref.owner;
      this.replica.x = ref.x - 30;
      this.replica.y = ref.y;
      this.replica.z = ref.z;
    }
  }

  get tick(): number {
    return this.replica.tick;
  }

  get owner(): string | null {
    return this.replica.owner;
  }

  get name(): string {
    return this._name;
  }

  get x(): number {
    return this.replica.x;
  }

  get y(): number {
    return this.replica.y;
  }

  get z(): number {
    return this._z;
  }

  get w(): number {
    return this.replica.w;
  }

  get h(): number {
    return this.replica.h;
  }

  synchronizeWith(remote: ReplicatedDeck) {
    if (remote.tick > this.tick) {
      this.replica = remote;
    }

    this.stride = this.replica.strides[this.replica.current];

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + "px";

    if (this.tick + 5 < this.scene.tick || this.owner === null) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
      this.ownerElem.innerHTML = this.owner;
    }
  }

  render(z: number, cards: Card[]): number {
    this._z = z;
    this.cards = cards;

    const x = this.x;
    const y = this.y;
    const w = this.w;
    const s = this.stride;

    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].render(x + w + s * i, y, z + 1 + i, this);
    }

    return z + 1 + this.cards.length;
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCards() + 1;
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
  }

  place(wasOutside: boolean) {
    const other = this.scene.overlapsCard(this);
    if (other === null) {
      return;
    }

    if (other.onDeck === null) {
      const [w, v] = this.gapFor(other.x);
      other.putOn(this, (w + v) * 0.5);
      return;
    }

    const [w, v] = this.gapFor(this.x);
    const n = this.cards.length;
    for (let i = 0; i < n; i++) {
      this.cards[i].putOn(other.onDeck, w + ((i + 1) / (n + 2)) * (v - w));
    }
  }

  fold() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.strides.length;
  }

  /** This modification is not atomic and may lead to inconsistencies */
  turn() {
    for (const card of this.cards) {
      card.turn();
      card.move(-card.x, card.y);
    }
  }

  /** This modification is not atomic and may lead to inconsistencies */
  shuffle() {
    for (const card of this.cards) {
      card.move(Math.random(), card.y);
    }
  }

  gapFor(x: number): [number, number] {
    let v: number = 0;
    // We use a small offset to bias card insertion to the left.
    // If you put a card very close on top to another one, the new
    // stackable will be placed on the left.
    for (const card of this.cards) {
      if (card.x + 10 > x) {
        return [v, card.x];
      } else {
        v = card.x;
      }
    }
    // Reached last card. Put the new card behind that one.
    return [v, v + 1];
  }
}
