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
  private _name: string;

  private _z: number = 0;

  private replica: ReplicatedPrivateArea = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 200,
    h: 200,
  };

  private scene: Scene;
  private elem: HTMLElement;

  constructor(scene: Scene, name: string) {
    this._name = name;
    this.scene = scene;

    this.elem = document.createElement("div");
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

  synchronizeWith(remote: ReplicatedPrivateArea) {
    if (remote.tick > this.tick) {
      this.replica = remote;
    }

    this.elem.style.left = this.x + "px";
    this.elem.style.top = this.y + "px";
    this.elem.style.width = this.w + "px";
    this.elem.style.height = this.h + "px";
  }

  render(z: number) {
    this._z = z;

    this.elem.style.zIndex = this.z.toString();

    return z + 1;
  }
}
