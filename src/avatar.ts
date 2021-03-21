interface ReplicatedAvatar {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  color: string;
  represents: string | null;
}

class Avatar {
  public key: string;
  public box: BoundingBox;

  private remoteTick: number;
  private replica: ReplicatedAvatar;

  private scene: Scene;
  private elem: HTMLElement;

  constructor(key: string, replica: ReplicatedAvatar, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 0, 150, 30);
    this.remoteTick = replica.tick;
    this.replica = replica;
    this.scene = scene;

    this.elem = document.createElement("div");
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);

    new DragAndDrop(this.elem, this);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedAvatar) {
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
    this.elem.style.backgroundColor = this.replica.color;
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    // TODO: We are wasting z space here if this item itself is on the top.
    this.replica.z = this.scene.topZ() + 1;
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
    //
  }

  changes(): ReplicatedAvatar | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
