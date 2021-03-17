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
  public name: string;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 100;
  public h: number = 150;
  public d: number = 2;
  public onDeck: Deck | null = null;

  public replica: ReplicatedCard;

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(name: string, replica: ReplicatedCard, scene: Scene) {
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

    new DragAndDrop(this.visElem, this);
  }

  /** Re-compute based on changes to replica. */
  synchronize() {
    if (this.onDeck === null) {
      this.x = this.replica.x;
      this.y = this.replica.y;
    }
    this.w = this.replica.w;
    this.h = this.replica.h;

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.zIndex = this.z.toString();
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";
    this.visElem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.visElem.style.backgroundColor = this.replica.colors[
      this.replica.current
    ];
    this.visElem.style.backgroundImage =
      "url(" + this.replica.images[this.replica.current] + ")";

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + this.h + "px";
    this.ownerElem.style.zIndex = (this.z + 1).toString();
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  /** Re-compute based on timing changes. */
  render() {
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
    this.replica.onDeck = null;
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
      if (!wasOutside) {
        this.turn();
      }
      return;
    }

    if (other.onDeck === null) {
      const deck = this.scene.createDeck(this);
      this.replica.tick = this.scene.tick;
      this.replica.owner = this.scene.playerId;
      this.replica.onDeck = deck.name;
      this.synchronize();
      other.replica.tick = this.scene.tick;
      other.replica.owner = this.scene.playerId;
      other.replica.onDeck = deck.name;
      other.synchronize();
      return;
    }

    const [w, v] = other.onDeck.gapFor(this.x);
    this.putOn(other.onDeck, (w + v) * 0.5);
  }

  turn() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.images.length;
    this.synchronize();
  }

  /** Put card onDeck at fractional index */
  putOn(onDeck: Deck, f: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.onDeck = onDeck.name;
    this.replica.x = f;
    this.synchronize();
  }
}
