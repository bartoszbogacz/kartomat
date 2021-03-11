interface ReplicatedCard {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  onDeck: string | null;
  images: string[];
  colors: string[];
  current: number;
}

class Card {
  private _name: string;
  private _onDeck: Deck | null = null;
  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  private _w: number = 100;
  private _h: number = 150;

  private replica: ReplicatedCard = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    onDeck: null,
    images: [""],
    colors: [""],
    current: 0,
  };

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(scene: Scene, name: string) {
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

    new DragAndDrop(this.visElem, this);
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

  get onDeck(): Deck | null {
    return this._onDeck;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get z(): number {
    return this._z;
  }

  get w(): number {
    return this._w;
  }

  get h(): number {
    return this._h;
  }

  synchronizeWith(remote: ReplicatedCard) {
    if (remote.tick > this.tick) {
      this.replica = remote;
    }

    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";
    this.visElem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.visElem.style.backgroundColor = this.replica.colors[
      this.replica.current
    ];
    this.visElem.style.backgroundImage =
      "url(" + this.replica.images[this.replica.current] + ")";

    if (this.tick + 5 < this.scene.tick || this.owner === null) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
      this.ownerElem.innerHTML = this.owner;
    }
  }

  render(x: number, y: number, z: number, onDeck: Deck | null) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._onDeck = onDeck;

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.zIndex = this.z.toString();

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + "px";
    this.ownerElem.style.zIndex = (this.z + 1).toString();
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.onDeck = null;
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

    if (other === null && wasOutside) {
      // Nothing to do
    } else if (other === null) {
      this.turn();
    } else if (other.onDeck === null) {
      const deck = this.scene.createDeck(this);
      this.replica.tick = this.scene.tick;
      this.replica.owner = this.scene.playerId;
      this.replica.onDeck = deck.name;
      other.replica.tick = this.scene.tick;
      other.replica.owner = this.scene.playerId;
      other.replica.onDeck = deck.name;
    } else {
      this.replica.tick = this.scene.tick;
      this.replica.owner = this.scene.playerId;
      this.replica.onDeck = other.onDeck.name;
      this.replica.x = other.onDeck.indexFor(this.x);
    }
  }

  turn() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.images.length;
  }
}
