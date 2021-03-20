interface ReplicatedMarble {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  color: string;
}

class Marble {
  public key: string;
  public replica: ReplicatedMarble;
  public box: BoundingBox;

  private remoteTick: number;

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(key: string, replica: ReplicatedMarble, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 15, 15);
    this.remoteTick = replica.tick;
    this.replica = replica;
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.className = "Marble";
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
  synchronize(remote: ReplicatedMarble) {
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

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";
    this.visElem.style.backgroundColor = this.replica.color;

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + 15 + "px";
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  render(zOffset: number) {
    this.visElem.style.zIndex = (this.replica.z + zOffset).toString();
    this.ownerElem.style.zIndex = (this.replica.z + zOffset).toString();

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
    // TODO: We are wasting z space here if this item itself is on the top.
    this.replica.z = this.scene.topZ() + 1;
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
    // Nothing happens
  }

  changed(): ReplicatedMarble | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
