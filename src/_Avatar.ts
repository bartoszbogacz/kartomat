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
  public name: string;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 100;
  public h: number = 30;
  public d: number = 1;

  public replica: ReplicatedAvatar;

  private scene: Scene;
  private elem: HTMLElement;

  constructor(name: string, replica: ReplicatedAvatar, scene: Scene) {
    this.name = name;
    this.replica = replica;
    this.scene = scene;

    this.elem = document.createElement("div");
    this.elem.style.position = "absolute";
    this.elem.style.userSelect = "none";
    document.body.appendChild(this.elem);

    new DragAndDrop(this.elem, this);
  }

  synchronize() {
    this.x = this.replica.x;
    this.y = this.replica.y;
    this.w = this.replica.w;
    this.h = this.replica.h;

    this.elem.style.left = this.x + "px";
    this.elem.style.top = this.y + "px";
    this.elem.style.width = this.w + "px";
    this.elem.style.height = this.h + "px";
    this.elem.style.zIndex = this.z.toString();
    this.elem.style.backgroundSize = this.w + "px " + this.h + "px";
    this.elem.style.backgroundColor = this.replica.color;
  }

  render() {
    //
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
    //
  }
}
