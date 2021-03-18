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
  public key: string;
  public replica: ReplicatedDeck;
  public box: BoundingBox;

  private remoteTick: number;
  private cards: Card[] = [];
  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(key: string, replica: ReplicatedDeck, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox();
    this.remoteTick = replica.tick;
    this.replica = replica;
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);

    this.ownerElem = document.createElement("div");
    this.ownerElem.style.position = "absolute";
    this.ownerElem.style.userSelect = "none";
    document.body.appendChild(this.ownerElem);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedDeck) {
    this.remoteTick = remote.tick;

    if (this.replica.tick > remote.tick) {
      return;
    }
    this.replica = remote;

    this._synchronize();
  }

  private _synchronize() {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.z = this.replica.z;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + this.box.h + "px";
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  render(z: number, cards: Card[]) {
    this.cards = cards;
    this.box.z = z;
    this.box.d = cards.length;

    for (let i = 0; i < this.cards.length; i++) {
      const x: number = this.box.x;
      const y: number = this.box.y;
      const z: number = this.box.z;
      const w: number = this.box.w;
      const s: number = this.replica.strides[this.replica.current];

      this.cards[i].render(x + w + s * i, y, z + 1 + i, this);
    }

    if (
      this.replica.tick + 5 < this.scene.tick ||
      this.replica.owner === null
    ) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
    }
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCards() + 1;
    this._synchronize();
    this.scene.render();
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this._synchronize();
    this.scene.render();
  }

  place(wasOutside: boolean) {
    const other = this.scene.overlapsCard(this);
    if (other === null) {
      return;
    }

    if (other.onDeck === null) {
      const [w, v] = this.gapFor(other.box.x);
      other.putOn(this, (w + v) * 0.5);
      return;
    }

    const [w, v] = this.gapFor(this.box.x);
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
    this._synchronize();
    this.scene.render();
  }

  /** This modification is not atomic and may lead to inconsistencies */
  turn() {
    for (const card of this.cards) {
      card.turn();
      card.move(-card.box.x, card.box.y);
    }
  }

  /** This modification is not atomic and may lead to inconsistencies */
  shuffle() {
    for (const card of this.cards) {
      card.move(Math.random(), card.box.y);
    }
  }

  gapFor(x: number): [number, number] {
    let v: number = 0;
    // We use a small offset to bias card insertion to the left.
    // If you put a card very close on top to another one, the new
    // stackable will be placed on the left.
    for (const card of this.cards) {
      if (card.box.x + 10 > x) {
        return [v, card.box.x];
      } else {
        v = card.box.x;
      }
    }
    // Reached last card. Put the new card behind that one.
    return [v, v + 1];
  }

  changed(): ReplicatedDeck | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
