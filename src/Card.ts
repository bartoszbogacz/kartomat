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
  public key: string;
  public box: BoundingBox;
  public onDeck: Deck | null = null;

  private remoteTick: number;
  private replica: ReplicatedCard;

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(key: string, replica: ReplicatedCard, scene: Scene) {
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

    new DragAndDrop(this.visElem, this);
  }

  get owner(): string | null {
    return this.replica.owner;
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedCard) {
    if (this.replica.tick > remote.tick) {
      return;
    }
    this.remoteTick = remote.tick;

    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.z = this.replica.z;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.zIndex = this.box.z.toString();
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";
    this.visElem.style.backgroundColor = this.replica.colors[
      this.replica.current
    ];
    this.visElem.style.backgroundImage =
      "url(" + this.replica.images[this.replica.current] + ")";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + this.box.h + "px";
    this.ownerElem.style.zIndex = (this.box.z + 1).toString();
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  /** Re-compute based on timing changes. */
  render(x: number, y: number, z: number, onDeck: Deck | null) {
    this.onDeck = onDeck;
    if (onDeck !== null) {
      this.box.x = x;
      this.box.y = y;
    }
    this.box.z = z;

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.zIndex = this.box.z.toString();

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + this.box.h + "px";
    this.ownerElem.style.zIndex = (this.box.z + 1).toString();

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
    this.synchronize(this.replica);
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this.synchronize(this.replica);
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
      this.replica.onDeck = deck.key;
      this.synchronize(this.replica);
      other.replica.tick = this.scene.tick;
      other.replica.owner = this.scene.playerId;
      other.replica.onDeck = deck.key;
      other.synchronize(this.replica);
      return;
    }

    const [w, v] = other.onDeck.gapFor(this.box.x);
    this.putOn(other.onDeck, (w + v) * 0.5);
  }

  turn() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.images.length;
    this.synchronize(this.replica);
  }

  /** Put card onDeck at fractional index */
  putOn(onDeck: Deck, f: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.onDeck = onDeck.key;
    this.replica.x = f;
    this.synchronize(this.replica);
  }

  changed(): ReplicatedCard | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
