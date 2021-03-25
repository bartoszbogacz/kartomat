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

    this.visElem = document.createElement("textarea");
    this.visElem.className = "Notepad";
    // Binding only onkeydown will not register single
    // characters being written, since textarea only
    // updates after onkeyup. Binding onkeyup only
    // will register repeated input only after a key
    // has been released, which can be longer than our
    // grace period for not ovewriteing the textarea.
    // We need to bind both handlers.
    this.visElem.onkeydown = this.textTyped.bind(this);
    this.visElem.onkeyup = this.textTyped.bind(this);
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);

    this.ownerElem = document.createElement("div");
    this.ownerElem.className = "PlayerTag";
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
    this.render();
  }

  private render() {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.zIndex = this.box.z.toString();
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";
    this.visElem.style.backgroundSize = this.box.w + "px " + this.box.h + "px";

    // We do not want to butt in when the user types, by setting the
    // the field differnetly, but at some point after user stoppped
    // typing we synchronize perform the synchronization update.
    if (this.replica.tick + 5 < this.scene.tick) {
      (this.visElem as any).value = this.replica.text;
    }

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

  textTyped(this: Notepad, _: Event) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.text = (this.visElem as any).value;
    this.render();
  }

  changes(): ReplicatedNotepad | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
