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
  private _rect: Rectangle = { x: 0, y: 0, z: 0, w: 100, h: 150 };

  private replica: ReplicatedCard;
  private scene: Scene;
  private elem: HTMLElement;
  private image: string = "";

  constructor(scene: Scene, name: string, replica: ReplicatedCard | null) {
    this._name = name;
    this.scene = scene;

    this.elem = document.createElement("div");
    new DragAndDrop(this.elem, this);

    if (replica === null) {
      this.replica = {
        tick: 0,
        owner: null,
        x: 0,
        y: 0,
        z: 0,
        w: 100,
        h: 150,
        onDeck: null,
        images: [""],
        colors: [""],
        current: 0,
      };
    } else {
      this.replica = replica;
    }
  }

  get name(): string {
    return this._name;
  }

  get onDeck(): Deck | null {
    return this._onDeck;
  }

  get rect(): Rectangle {
    return this._rect;
  }

  update() {
    this.image = this.replica.images[this.replica.current];
    this.elem.style.width = this.rect.w + "px";
    this.elem.style.height = this.rect.h + "px";
  }

  render(x: number, y: number, z: number, onDeck: Deck | null) {
    this._rect.x = x;
    this._rect.y = y;
    this._rect.z = z;
    this._onDeck = onDeck;

    this.elem.style.left = this.rect.x + "px";
    this.elem.style.top = this.rect.y + "px";
    this.elem.style.zIndex = this.rect.z.toString();
    this.elem.style.backgroundImage = this.image;
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCardsAndDecks() + 1;
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
  }

  place(wasOutside: boolean) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    const other = this.scene.largestOverlapWithCard(this);
    if (other === null) {
      //
    } else if (other.onDeck === null) {
      const deck = this.scene.createDeck();
      this.replica.onDeck = deck.name;
      other.replica.onDeck = deck.name;
    } else {
      this.replica.tick = this.scene.tick;
      this.replica.owner = this.scene.playerId;
      this.replica.onDeck = other.onDeck.name;
      this.replica.x = other.onDeck.indexAt(this.rect.x);
    }
  }
}
