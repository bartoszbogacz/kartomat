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
  private _name: string;

  private _z: number = 0;

  private replica: ReplicatedBoard = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    image: "",
  };

  private scene: Scene;
  private visElem: HTMLElement;

  constructor(scene: Scene, name: string) {
    this._name = name;
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);
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

  synchronizeWith(remote: ReplicatedBoard) {
    if (remote.tick > this.tick) {
      this.replica = remote;
    }

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";
    this.visElem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.visElem.style.backgroundImage = this.replica.image;
  }

  render(z: number): number {
    this._z = z;

    this.visElem.style.zIndex = this.z.toString();

    return z + 1;
  }
}
