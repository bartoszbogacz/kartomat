interface ReplicatedNotepad {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  text: string;
}

class Notepad {
  public key: string;
  public box: BoundingBox;

  private remoteTick: number;
  private replica: ReplicatedNotepad;

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(key: string, replica: ReplicatedNotepad, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 0, 100, 100);
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
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedNotepad) {
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
    this.layout();
  }

  private layout() {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    const visibility =
      this.replica.tick + 5 < this.scene.tick || this.replica.owner === null
        ? "hidden"
        : "visible";

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.zIndex = this.box.z.toString();
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + 15 + "px";
    this.ownerElem.style.zIndex = this.box.z.toString();
    this.ownerElem.style.visibility = visibility;
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  changes(): ReplicatedNotepad | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
