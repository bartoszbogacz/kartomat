interface ReplicatedMarble {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  color: string;
}

class Marble {
  private _name: string;

  private _z: number = 0;

  private replica: ReplicatedMarble = {
    tick: 0,
    owner: null,
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    h: 0,
    color: "",
  };

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(scene: Scene, name: string) {
    this._name = name;
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

  synchronize(remote: ReplicatedMarble) {
    if (remote.tick > this.tick) {
      this.replica = remote;
      this.update();
    }
  }

  update() {
    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";
    this.visElem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.visElem.style.backgroundColor = this.replica.color;

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + 15 + "px";
    this.ownerElem.innerHTML = this.owner || "";
  }

  render(z: number) {
    this._z = z;

    this.visElem.style.zIndex = this.z.toString();
    this.ownerElem.style.zIndex = (this.z + 1).toString();
    if (this.tick + 5 < this.scene.tick || this.owner === null) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
    }

    return z + 2;
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCards() + 1;
    this.update();
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this.update();
  }

  place(wasOutside: boolean) {
    // Nothing happens
  }
}
