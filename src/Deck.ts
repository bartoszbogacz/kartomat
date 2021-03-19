interface ReplicatedDeck {
  tick: number;
  owner: string | null;

  x: number;
  y: number;
  z: number;
  w: number;
  h: number;

  strides: number[];
  current: number;
}

class Deck {
  public key: string;
  public replica: ReplicatedDeck;
  public box: BoundingBox;

  private remoteTick: number = 0;
  private cards: Card[] = [];
  private scene: Scene;

  private visElem: HTMLElement;
  private ownerElem: HTMLElement;

  private moveElem: HTMLElement;
  private shuffleElem: HTMLElement;
  private foldElem: HTMLElement;
  private turnElem: HTMLElement;

  constructor(key: string, scene: Scene) {
    this.key = key;
    this.box = new BoundingBox();
    this.replica = {
      tick: 0,
      owner: null,
      x: 0,
      y: 0,
      z: 0,
      w: 30,
      h: 150,
      strides: [2, 20],
      current: 1,
    };
    this.scene = scene;

    this.visElem = document.createElement("div");
    this.visElem.style.position = "absolute";
    this.visElem.style.userSelect = "none";
    document.body.appendChild(this.visElem);

    this.ownerElem = document.createElement("div");
    this.ownerElem.style.position = "absolute";
    this.ownerElem.style.userSelect = "none";
    document.body.appendChild(this.ownerElem);

    this.moveElem = document.createElement("div");
    this.moveElem.className = "Control";
    this.moveElem.style.position = "absolute";
    this.moveElem.style.width = "30px";
    this.moveElem.style.height = "30px";
    this.moveElem.style.backgroundImage = 'url("controls/move.png")';
    this.moveElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.moveElem);

    this.shuffleElem = document.createElement("div");
    this.shuffleElem.className = "Control";
    this.shuffleElem.style.position = "absolute";
    this.shuffleElem.style.width = "30px";
    this.shuffleElem.style.height = "30px";
    this.shuffleElem.style.backgroundImage = 'url("controls/shuffle.png")';
    this.shuffleElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.shuffleElem);

    this.foldElem = document.createElement("div");
    this.foldElem.className = "Control";
    this.foldElem.style.position = "absolute";
    this.foldElem.style.width = "30px";
    this.foldElem.style.height = "30px";
    this.foldElem.style.backgroundImage = 'url("controls/fold.png")';
    this.foldElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.foldElem);

    this.turnElem = document.createElement("div");
    this.turnElem.className = "Control";
    this.turnElem.style.position = "absolute";
    this.turnElem.style.width = "30px";
    this.turnElem.style.height = "30px";
    this.turnElem.style.backgroundImage = 'url("controls/turn.png")';
    this.turnElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.turnElem);

    new DragAndDrop(this.moveElem, this);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedDeck) {
    this.remoteTick = remote.tick;

    if (this.replica.tick > remote.tick) {
      return;
    }
    this.replica = remote;

    this._synchronize();
  }

  private _synchronize() {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.z = this.replica.z;
    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

    this.visElem.style.left = this.box.x + "px";
    this.visElem.style.top = this.box.y + "px";
    this.visElem.style.width = this.box.w + "px";
    this.visElem.style.height = this.box.h + "px";

    this.ownerElem.style.left = this.box.x + "px";
    this.ownerElem.style.top = this.box.y + this.box.h + "px";
    this.ownerElem.innerHTML = this.replica.owner || "";
  }

  render(z: number) {
    const cards = this.scene.cardsOnDeck[this.key];
    this.cards = cards ? cards : [];
    this.cards.sort((a, b) => a.box.x - b.box.x);
    this.box.z = this.replica.z + z;
    this.box.d = this.cards.length;

    for (let i = 0; i < this.cards.length; i++) {
      const x: number = this.box.x;
      const y: number = this.box.y;
      const z: number = this.box.z;
      const w: number = this.box.w;
      const stride = this.replica.strides[this.replica.current];
      const s: number = stride ? stride : 2;
      this.cards[i]?.renderOnDeck(x + w + s * i, y, z + 1 + i);
    }

    if (this.cards.length > 1) {
      this.moveElem.style.left = this.box.x + "px";
      this.moveElem.style.top = this.box.y + "px";
      this.moveElem.style.zIndex = this.box.z.toString();
      this.moveElem.style.visibility = "visible";

      this.shuffleElem.style.left = this.box.x + "px";
      this.shuffleElem.style.top = this.box.y + 30 + "px";
      this.shuffleElem.style.zIndex = this.box.z.toString();
      this.shuffleElem.style.visibility = "visible";

      this.foldElem.style.left = this.box.x + "px";
      this.foldElem.style.top = this.box.y + 60 + "px";
      this.foldElem.style.zIndex = this.box.z.toString();
      this.foldElem.style.visibility = "visible";

      this.turnElem.style.left = this.box.x + "px";
      this.turnElem.style.top = this.box.y + 90 + "px";
      this.turnElem.style.zIndex = this.box.z.toString();
      this.turnElem.style.visibility = "visible";
    } else {
      this.moveElem.style.visibility = "hidden";
      this.shuffleElem.style.visibility = "hidden";
      this.foldElem.style.visibility = "hidden";
      this.turnElem.style.visibility = "hidden";
    }

    if (
      this.replica.tick + 5 < this.scene.tick ||
      this.replica.owner === null
    ) {
      this.ownerElem.style.visibility = "hidden";
    } else {
      this.ownerElem.style.visibility = "visible";
      this.ownerElem.style.zIndex = this.box.z.toString();
    }
  }

  take() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.z = this.scene.topZOfCards() + 1;
    this._synchronize();
    this.scene.render();
  }

  move(x: number, y: number) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this._synchronize();
    this.scene.render();
  }

  place(wasOutside: boolean) {
    const other = this.scene.overlapsCard(this);
    if (other === null) {
      return;
    }

    if (other.replica.onDeck === null) {
      const [w, v] = this.gapFor(other.box.x);
      other.putOn(this, (w + v) * 0.5);
      return;
    }

    const otherDeck = this.scene.decks[other.replica.onDeck];
    if (otherDeck) {
      const [w, v] = otherDeck.gapFor(this.box.x);
      const n = this.cards.length;
      for (let i = 0; i < n; i++) {
        this.cards[i]?.putOn(otherDeck, w + ((i + 1) / (n + 2)) * (v - w));
      }
    }
  }

  fold() {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.strides.length;
    this._synchronize();
    this.scene.render();
  }

  /** This modification is not atomic and may lead to inconsistencies */
  turn() {
    for (const card of this.cards) {
      card.turn();
      card.move(-card.box.x, card.box.y);
    }
  }

  /** This modification is not atomic and may lead to inconsistencies */
  shuffle() {
    for (const card of this.cards) {
      card.move(Math.random(), card.box.y);
    }
  }

  gapFor(x: number): [number, number] {
    let v: number = 0;
    // We use a small offset to bias card insertion to the left.
    // If you put a card very close on top to another one, the new
    // stackable will be placed on the left.
    for (const card of this.cards) {
      if (card.box.x + 10 > x) {
        return [v, card.box.x];
      } else {
        v = card.box.x;
      }
    }
    // Reached last card. Put the new card behind that one.
    return [v, v + 1];
  }

  orientate(ref: Card) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = ref.replica.x - 30;
    this.replica.y = ref.replica.y;
    this.replica.z = ref.replica.z;
    this._synchronize();
    this.scene.render();
  }

  changed(): ReplicatedDeck | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
