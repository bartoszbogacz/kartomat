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
  public replica: ReplicatedCard;
  public box: BoundingBox;

  private remoteTick: number;
  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(key: string, replica: ReplicatedCard, scene: Scene) {
    this.key = key;
    this.replica = replica;
    this.remoteTick = 0;
    this.box = new BoundingBox(0, 0, 0, 100, 150);
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.className = "Card";
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);

    this.ownerElem = document.createElement("div");
    this.ownerElem.className = "PlayerTag";
    this.ownerElem.style.position = "absolute";
    this.ownerElem.style.userSelect = "none";
    document.body.appendChild(this.ownerElem);

    new DragAndDrop(this.visElem, this);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedCard) {
    this.remoteTick = remote.tick;

    if (this.replica.tick > remote.tick) {
      return;
    }
    this.replica = remote;
  }

  layoutByScene(zOffset: number) {
    //
  }

  layoutByPrivateArea(zOffset: number) {
    if (this.replica.onDeck === null) {
      this.box.x = this.replica.x;
      this.box.y = this.replica.y;
      this.box.z = this.replica.z + zOffset;
      this.render();
    }
  }

  /** Rendering when card is on a deck, x y z are taken literally. */
  layoutByDeck(x: number, y: number, z: number) {
    this.box.x = x;
    this.box.y = y;
    this.box.z = z;
    this.render();
  }

  private render() {
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    const color = this.replica.colors[this.replica.current];
    const image = this.replica.images[this.replica.current];

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.zIndex = this.box.z.toString();
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";
    this.visElem.style.backgroundColor = color ? color : "";
    this.visElem.style.backgroundImage = "url(" + (image ? image : "") + ")";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + this.box.h + "px";
    this.ownerElem.style.zIndex = this.box.z.toString();

    if (
      this.replica.owner === null ||
      this.replica.tick + 5 < this.scene.tick
    ) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
      this.ownerElem.innerHTML =
        this.scene.playerNames[this.replica.owner] || this.replica.owner;
    }
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = this.box.x;
    this.replica.y = this.box.y;
    // TODO: We are wasting z space here if this item itself is on the top.
    this.replica.z = this.scene.topZ() + 1;
    this.replica.onDeck = null;
    this.scene.layout();
  }

  move(x: number, y: number) {
    this.box.x = x;
    this.box.y = y;
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this.render();
  }

  place(wasOutside: boolean) {
    const other = this.scene.overlapsCard(this);
    if (other === null) {
      if (!wasOutside) {
        this.turn();
      }
      return;
    }

    if (other.replica.onDeck === null) {
      const deck = this.scene.createDeck(other);
      this.replica.tick = this.scene.tick;
      this.replica.owner = this.scene.playerId;
      this.replica.onDeck = deck.key;
      other.replica.tick = this.scene.tick;
      other.replica.owner = this.scene.playerId;
      other.replica.onDeck = deck.key;
      this.scene.layout();
      return;
    }

    const otherDeck = this.scene.decks[other.replica.onDeck];
    if (otherDeck) {
      const [w, v] = otherDeck.gapFor(this.box.x);
      this.putOn(otherDeck, (w + v) * 0.5);
    }
  }

  turn() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.images.length;
    this.render();
  }

  /** Put card onDeck at fractional index */
  putOn(onDeck: Deck, f: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.onDeck = onDeck.key;
    this.replica.x = f;
    this.scene.layout();
  }

  changes(): ReplicatedCard | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
