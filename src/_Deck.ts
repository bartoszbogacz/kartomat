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
  private _rect: Rectangle = { x: 0, y: 0, z: 0, w: 30, h: 150 };
  private stride: number = 10;
  private cards: Card[] = [];

  private replica: ReplicatedDeck;
  private scene: Scene;
  private elem: HTMLElement;

  constructor(scene: Scene, name: string, replica: ReplicatedDeck | null) {
    this._name = name;
    this.scene = scene;
    this.elem = document.createElement("div");
    if (replica === null) {
      this.replica = {
        tick: 0,
        owner: null,
        x: 0,
        y: 0,
        z: 0,
        w: 30,
        h: 150,
        strides: [2, 10],
        current: 1,
      };
    } else {
      this.replica = replica;
    }
  }

  get name(): string {
    return this._name;
  }

  get rect(): Rectangle {
    return this._rect;
  }

  indexAt(x: number): number {
    return 0;
  }

  update() {
    this._rect.x = this.replica.x;
    this._rect.y = this.replica.y;
    this._rect.w = this.replica.w;
    this._rect.h = this.replica.h;
    this.stride = this.replica.strides[this.replica.current];

    this.elem.style.left = this.rect.x + "px";
    this.elem.style.top = this.rect.y + "px";
    this.elem.style.width = this.rect.w + "px";
    this.elem.style.height = this.rect.h + "px";
  }

  render(z: number, cards: Card[]) {
    this._rect.z = z;
    this.cards = cards;

    const x = this.rect.x;
    const y = this.rect.y;
    const w = this.rect.w;
    const s = this.stride;

    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].render(x + w + s * i, y, z + 1 + i, this);
    }
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCardsAndDecks() + 1;
  }
}
