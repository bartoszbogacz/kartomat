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

  private scene: Scene;
  private elem: HTMLElement;

  constructor(key: string, remote: ReplicatedBoard, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox();
    this.remoteTick = remote.tick;
    this.replica = remote;
    this.scene = scene;

    this.elem = document.createElement("div");
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);
  }

  synchronize(remote: ReplicatedBoard) {
    if (this.replica.tick > remote.tick) {
      return;
    }
    this.remoteTick = remote.tick;

    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.elem.style.left = this.box.x + "px";
    this.elem.style.top = this.box.y + "px";
    this.elem.style.width = this.box.w + "px";
    this.elem.style.height = this.box.h + "px";
    this.elem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";
    this.elem.style.backgroundImage = "url(" + this.replica.image + ")";
  }

  render(z: number) {
    this.box.z = z;
    this.elem.style.zIndex = this.box.z.toString();
  }

  changed(): ReplicatedBoard | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
