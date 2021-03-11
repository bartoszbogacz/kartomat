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
  private _name: string;

  private _z: number = 0;

  private replica: ReplicatedAvatar = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    color: "",
    represents: null,
  };

  private scene: Scene;
  private elem: HTMLElement;

  constructor(scene: Scene, name: string) {
    this._name = name;
    this.scene = scene;

    this.elem = document.createElement("div");
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);

    new DragAndDrop(this.elem, this);
  }

  get name(): string {
    return this._name;
  }

  get tick(): number {
    return this.replica.tick;
  }

  get owner(): string | null {
    return this.replica.owner;
  }

  get x(): number {
    return this.replica.x;
  }

  get y(): number {
    return this.replica.y;
  }

  get z(): number {
    return this._z;
  }

  get w(): number {
    return this.replica.w;
  }

  get h(): number {
    return this.replica.h;
  }

  synchronizeWith(remote: ReplicatedAvatar) {
    if (remote.tick > this.tick) {
      this.replica = remote;
    }

    this.elem.style.left = this.x + "px";
    this.elem.style.top = this.y + "px";
    this.elem.style.width = this.w + "px";
    this.elem.style.height = this.h + "px";
    this.elem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.elem.style.backgroundColor = this.replica.color;
  }

  render(z: number): number {
    this._z = z;

    this.elem.style.zIndex = this.z.toString();

    return z + 1;
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
}
