interface ReplicatedAvatar {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  color: string;
  text: string;
  represents: string | null;
}

class Avatar {
  public key: string;
  public replica: ReplicatedAvatar;
  public box: BoundingBox;

  private remoteTick: number;

  private scene: Scene;
  private elem: HTMLElement;

  constructor(key: string, replica: ReplicatedAvatar, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox(0, 0, 0, 150, 30);
    this.remoteTick = replica.tick;
    this.replica = replica;
    this.scene = scene;

    this.elem = document.createElement("textarea");
    // Binding only onkeydown will not register single
    // characters being written, since textarea only
    // updates after onkeyup. Binding onkeyup only
    // will register repeated input only after a key
    // has been released, which can be longer than our
    // grace period for not ovewriteing the textarea.
    // We need to bind both handlers.
    this.elem.onkeydown = this.textTyped.bind(this);
    this.elem.onkeyup = this.textTyped.bind(this);
    (this.elem as any).value = this.replica.text;
    this.elem.className = "NoPlayerAvatar";
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    this.elem.style.touchAction = "none";
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

    if (this.replica.represents === this.scene.playerId) {
      this.elem.className = "ThisPlayerAvatar";
    } else if (this.replica.represents === null) {
      this.elem.className = "NoPlayerAvatar";
    } else {
      this.elem.className = "OtherPlayerAvatar";
    }

    this.elem.style.left = this.box.x + "px";
    this.elem.style.top = this.box.y + "px";
    this.elem.style.zIndex = this.box.z.toString();
    this.elem.style.width = this.box.w + "px";
    this.elem.style.height = this.box.h + "px";

    if (this.replica.represents === this.scene.playerId) {
      (this.elem as any).disabled = false;
      // We do not want to butt in when the user types, by setting the
      // the field differnetly, but at some point after user stoppped
      // typing we synchronize perform the synchronization update.
      if (this.replica.tick + 5 < this.scene.tick) {
        (this.elem as any).value = this.replica.text;
      }
    } else {
      (this.elem as any).disabled = true;
      (this.elem as any).value = this.replica.text;
    }
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

  place(_: boolean) {
    //
  }

  textTyped(this: Avatar, _: Event) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.text = (this.elem as any).value;
    this.render();
  }

  changes(): ReplicatedAvatar | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
