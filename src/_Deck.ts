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
  public name: string;
  public replica: ReplicatedDeck;
  public tick: number = 0;
  public owner: string | null = null;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 100;
  public h: number = 150;
  public d: number = 2;
  public cards: Card[] = [];

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(name: string, replica: ReplicatedDeck, scene: Scene) {
    this.name = name;
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

  synchronize() {
    this.tick = this.replica.tick;
    this.owner = this.replica.owner;
    this.x = this.replica.x;
    this.y = this.replica.y;
    this.w = this.replica.w;
    this.h = this.replica.h;

    this.d = this.cards.length;

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + this.h + "px";
    this.ownerElem.innerHTML = this.owner || "";

    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].x =
        this.x + this.w + this.replica.strides[this.replica.current] * i;
      this.cards[i].y = this.y;
      this.cards[i].z = this.z + 1 * i;
      this.cards[i].onDeck = this;
      this.cards[i].synchronize();
    }
  }

  render() {
    if (this.tick + 5 < this.scene.tick || this.owner === null) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
    }
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCards() + 1;
    this.synchronize();
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this.synchronize();
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
    this.synchronize();
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
