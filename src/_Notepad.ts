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
  public name: string;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 15;
  public h: number = 15;
  public d: number = 2;

  public replica: ReplicatedNotepad;

  private scene: Scene;
  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  constructor(name: string, replica: ReplicatedNotepad, scene: Scene) {
    this.name = name;
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

  synchronize() {
    this.x = this.replica.x;
    this.y = this.replica.y;
    this.w = this.replica.w;
    this.h = this.replica.h;

    this.visElem.style.left = this.x + "px";
    this.visElem.style.top = this.y + "px";
    this.visElem.style.width = this.w + "px";
    this.visElem.style.height = this.h + "px";
    this.visElem.style.zIndex = this.z.toString();
    this.visElem.style.backgroundSize = this.w + "px " + this.h + "px";

    this.ownerElem.style.left = this.x + "px";
    this.ownerElem.style.top = this.y + 15 + "px";
    this.ownerElem.style.zIndex = (this.z + 1).toString();
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  render() {
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
}
