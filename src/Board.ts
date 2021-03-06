interface ReplicatedBoard {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  image: string;
}

class Board {
  public key: string;
  public box: BoundingBox;

  private remoteTick: number;
  private replica: ReplicatedBoard;

  private elem: HTMLElement;

  constructor(key: string, remote: ReplicatedBoard, _: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 0, 100, 100);
    this.remoteTick = remote.tick;
    this.replica = remote;

    this.elem = document.createElement("div");
    this.elem.className = "Board";
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedBoard) {
    this.remoteTick = remote.tick;

    if (this.replica.tick > remote.tick) {
      return;
    }
    this.replica = remote;
  }

  layoutByScene(zOffset: number) {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.z = zOffset + this.replica.z;
    this.render();
  }

  private render() {
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.elem.style.left = this.box.x + "px";
    this.elem.style.top = this.box.y + "px";
    this.elem.style.zIndex = this.box.z.toString();
    this.elem.style.width = this.box.w + "px";
    this.elem.style.height = this.box.h + "px";
    this.elem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";
    this.elem.style.backgroundImage = "url(" + this.replica.image + ")";
  }

  changes(): ReplicatedBoard | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
