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

  synchronize(remote: ReplicatedNotepad) {
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
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + 15 + "px";
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  render(z: number) {
    this.box.z = z;

    this.visElem.style.zIndex = this.box.z.toString();
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
    this.replica.z = this.scene.topZOfCards() + 1;
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
  }

  place(wasOutside: boolean) {
    // Nothing happens
  }

  changed(): ReplicatedNotepad | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
