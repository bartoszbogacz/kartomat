interface ReplicatedPrivateArea {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

class PrivateArea {
  public key: string;
  public box: BoundingBox;

  private remoteTick: number;
  private replica: ReplicatedPrivateArea;

  private scene: Scene;
  private elem: HTMLElement;

  constructor(key: string, replica: ReplicatedPrivateArea, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 100, 100);
    this.remoteTick = replica.tick;
    this.replica = replica;
    this.scene = scene;

    this.elem = document.createElement("div");
    this.elem.className = "PrivateArea";
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedPrivateArea) {
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
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.elem.style.left = this.box.x + "px";
    this.elem.style.top = this.box.y + "px";
    this.elem.style.width = this.box.w + "px";
    this.elem.style.height = this.box.h + "px";
  }

  render(zOffset: number) {
    for (const [key, deck] of Object.entries(this.scene.decks)) {
      if (deck.replica.owner !== this.scene.playerId) {
        deck.renderByPrivateArea(this.replica.z + zOffset);
      }
    }

    for (const [key, card] of Object.entries(this.scene.cards)) {
      if (card.replica.owner !== this.scene.playerId) {
        card.renderByPrivateArea(this.replica.z + zOffset);
      }
    }

    this.elem.style.zIndex = (this.replica.z + zOffset + 10000).toString();

    for (const [key, deck] of Object.entries(this.scene.decks)) {
      if (deck.replica.owner === this.scene.playerId) {
        deck.renderByPrivateArea(zOffset + 10000);
      }
    }

    for (const [key, card] of Object.entries(this.scene.cards)) {
      if (card.replica.owner === this.scene.playerId) {
        card.renderByPrivateArea(zOffset + 10000);
      }
    }
  }

  changed(): ReplicatedPrivateArea | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
