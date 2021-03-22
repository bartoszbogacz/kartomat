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

  private ownerElem: HTMLElement;

  private moveElem: HTMLElement;
  private shuffleElem: HTMLElement;
  private foldElem: HTMLElement;
  private turnElem: HTMLElement;

  constructor(key: string, replica: ReplicatedDeck, scene: Scene) {
    this.key = key;
    this.replica = replica;
    this.box = new BoundingBox(0, 0, 0, 30, 150);
    this.scene = scene;

    this.ownerElem = document.createElement("div");
    this.ownerElem.className = "PlayerTag";
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

    new DragAndDrop(this.moveElem, this);

    this.shuffleElem = document.createElement("div");
    this.shuffleElem.className = "Control";
    this.shuffleElem.style.position = "absolute";
    this.shuffleElem.style.width = "30px";
    this.shuffleElem.style.height = "30px";
    this.shuffleElem.style.backgroundImage = 'url("controls/shuffle.png")';
    this.shuffleElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.shuffleElem);

    this.shuffleElem.addEventListener("mousedown", this.shuffle.bind(this), {
      passive: false,
      capture: true,
    });

    this.foldElem = document.createElement("div");
    this.foldElem.className = "Control";
    this.foldElem.style.position = "absolute";
    this.foldElem.style.width = "30px";
    this.foldElem.style.height = "30px";
    this.foldElem.style.backgroundImage = 'url("controls/fold.png")';
    this.foldElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.foldElem);

    this.foldElem.addEventListener("mousedown", this.fold.bind(this), {
      passive: false,
      capture: true,
    });

    this.turnElem = document.createElement("div");
    this.turnElem.className = "Control";
    this.turnElem.style.position = "absolute";
    this.turnElem.style.width = "30px";
    this.turnElem.style.height = "30px";
    this.turnElem.style.backgroundImage = 'url("controls/turn.png")';
    this.turnElem.style.backgroundSize = "30px 30px";
    document.body.appendChild(this.turnElem);

    this.turnElem.addEventListener("mousedown", this.turn.bind(this), {
      passive: false,
      capture: true,
    });
  }

  static fromCard(key: string, ref: Card, scene: Scene): Deck {
    const replica: ReplicatedDeck = {
      tick: scene.tick,
      owner: scene.playerId,
      x: ref.replica.x - 30,
      y: ref.replica.y,
      z: ref.replica.z,
      w: 30,
      h: 150,
      strides: [0, 20],
      current: 1,
    };
    return new Deck(key, replica, scene);
  }

  /** Re-compute based on changes to replica. */
  synchronize(remote: ReplicatedDeck) {
    this.remoteTick = remote.tick;

    if (this.replica.tick > remote.tick) {
      return;
    }
    this.replica = remote;
  }

  layoutByScene(zOffset: number) {
    //
  }

  layoutByPrivateArea(zOffset: number) {
    this.box.x = this.replica.x;
    this.box.y = this.replica.y;
    this.box.z = zOffset + this.replica.z;
    this.render();
  }

  private render() {
    const cards = this.scene.cardsOnDeck[this.key];
    this.cards = cards ? cards : [];
    this.cards.sort((a, b) => a.replica.x - b.replica.x);

    this.box.w = this.replica.w;
    this.box.h = this.replica.h;

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

    const x: number = this.box.x;
    const y: number = this.box.y;
    const w: number = this.box.w;
    const z: number = this.box.z;
    const stride = this.replica.strides[this.replica.current];
    const s: number = stride ? stride : 2;

    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i]?.layoutByDeck(x + w + s * i, y, z + 1 + i);
    }
  }

  take(this: Deck) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    // TODO: We are wasting z space here if this item itself is on the top.
    this.replica.z = this.scene.topZ() + 1;
    this.render();
  }

  move(this: Deck, x: number, y: number) {
    this.box.x = x;
    this.box.y = y;
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.x = x;
    this.replica.y = y;
    this.render();
  }

  place(this: Deck, wasOutside: boolean) {
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

  fold(this: Deck) {
    this.replica.tick = this.scene.tick;
    this.replica.owner = this.scene.playerId;
    this.replica.current =
      (this.replica.current + 1) % this.replica.strides.length;
    this.render();
  }

  /** This modification is not atomic and may lead to inconsistencies */
  turn(this: Deck) {
    for (const card of this.cards) {
      card.turn();
      card.move(-card.replica.x, card.replica.y);
    }
    this.render();
  }

  /** This modification is not atomic and may lead to inconsistencies */
  shuffle(this: Deck) {
    for (const card of this.cards) {
      card.move(Math.random(), card.replica.y);
    }
    this.render();
  }

  gapFor(x: number): [number, number] {
    let v: number = 0;
    let f: number = 0;
    // We use a small offset to bias card insertion to the left.
    // If you put a card very close on top to another one, the new
    // stackable will be placed on the left.
    for (const card of this.cards) {
      if (card.box.x + 3 > x) {
        return [f, card.replica.x];
      } else {
        v = card.box.x;
        f = card.replica.x;
      }
    }
    // Reached last card. Put the new card behind that one.
    return [f, f + 1];
  }

  changes(): ReplicatedDeck | null {
    if (this.replica.tick > this.remoteTick) {
      return this.replica;
    } else {
      return null;
    }
  }
}
