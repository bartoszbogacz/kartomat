export interface SceneConfig {
  board?: { x: number; y: number; w: number; h: number; image: string };
  privateArea?: { x: number; y: number; w: number; h: number };
  notepad?: { x: number; y: number; w: number; h: number; text: string };
  avatars?: { x: number; y: number; text: string }[];
  marbles?: { x: number; y: number; color: string }[];
  decks?: {
    x: number;
    y: number;
    cards: { texts: string[]; colors: string[] }[] | { images: string[] }[];
  }[];
}

export const DOG6: SceneConfig = {
  board: { x: 0, y: 0, w: 770, h: 770, image: "boards/dog.jpeg" },
  privateArea: { x: 830, y: 470, w: 500, h: 300 },
  notepad: { x: 1100, y: 200, w: 230, h: 250, text: "Write here." },
  avatars: [
    { x: 920, y: 30, text: "Player1" },
    { x: 1130, y: 30, text: "Player2" },
    { x: 920, y: 70, text: "Player3" },
    { x: 1130, y: 70, text: "Player4" },
    { x: 920, y: 110, text: "Player5" },
    { x: 1130, y: 110, text: "Player6" },
  ],
  marbles: [
    { x: 418, y: 62, color: "Forestgreen" },
    { x: 387, y: 56, color: "Forestgreen" },
    { x: 358, y: 56, color: "Forestgreen" },
    { x: 326, y: 56, color: "Forestgreen" },
    { x: 609, y: 170, color: "Dimgray" },
    { x: 625, y: 195, color: "Dimgray" },
    { x: 642, y: 219, color: "Dimgray" },
    { x: 654, y: 247, color: "Dimgray" },
    { x: 660, y: 473, color: "Gold" },
    { x: 645, y: 503, color: "Gold" },
    { x: 633, y: 532, color: "Gold" },
    { x: 615, y: 555, color: "Gold" },
    { x: 425, y: 676, color: "Crimson" },
    { x: 394, y: 680, color: "Crimson" },
    { x: 360, y: 680, color: "Crimson" },
    { x: 332, y: 681, color: "Crimson" },
    { x: 127, y: 566, color: "Snow" },
    { x: 109, y: 540, color: "Snow" },
    { x: 93, y: 512, color: "Snow" },
    { x: 79, y: 484, color: "Snow" },
    { x: 79, y: 254, color: "Dodgerblue" },
    { x: 95, y: 221, color: "Dodgerblue" },
    { x: 108, y: 194, color: "Dodgerblue" },
    { x: 126, y: 172, color: "Dodgerblue" },
  ],
  decks: [
    {
      x: 830,
      y: 270,
      cards: [
        { images: ["rummy/club_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
      ],
    },
  ],
};

export const DOG8: SceneConfig = {
  board: { x: 0, y: 0, w: 770, h: 770, image: "boards/dog.jpeg" },
  privateArea: { x: 830, y: 470, w: 500, h: 300 },
  notepad: { x: 1100, y: 200, w: 230, h: 250, text: "Write here." },
  avatars: [
    { x: 920, y: 30, text: "Player1" },
    { x: 1130, y: 30, text: "Player2" },
    { x: 920, y: 70, text: "Player3" },
    { x: 1130, y: 70, text: "Player4" },
    { x: 920, y: 110, text: "Player5" },
    { x: 1130, y: 110, text: "Player6" },
    { x: 920, y: 150, text: "Player7" },
    { x: 1130, y: 150, text: "Player8" },
  ],
  marbles: [
    { x: 730, y: 265, color: "Mediumorchid" },
    { x: 701, y: 200, color: "Mediumorchid" },
    { x: 715, y: 234, color: "Mediumorchid" },
    { x: 726, y: 482, color: "Dodgerblue" },
    { x: 715, y: 515, color: "Dodgerblue" },
    { x: 700, y: 548, color: "Dodgerblue" },
    { x: 545, y: 700, color: "Forestgreen" },
    { x: 512, y: 714, color: "Forestgreen" },
    { x: 480, y: 729, color: "Forestgreen" },
    { x: 484, y: 20, color: "Dimgray" },
    { x: 551, y: 46, color: "Dimgray" },
    { x: 517, y: 33, color: "Dimgray" },
    { x: 47, y: 196, color: "Gold" },
    { x: 33, y: 228, color: "Gold" },
    { x: 19, y: 262, color: "Gold" },
    { x: 266, y: 19, color: "Crimson" },
    { x: 200, y: 45, color: "Crimson" },
    { x: 234, y: 32, color: "Crimson" },
    { x: 17, y: 480, color: "Darkturquoise" },
    { x: 32, y: 513, color: "Darkturquoise" },
    { x: 46, y: 544, color: "Darkturquoise" },
    { x: 231, y: 713, color: "Orange" },
    { x: 262, y: 725, color: "Orange" },
    { x: 198, y: 699, color: "Orange" },
  ],
  decks: [
    {
      x: 830,
      y: 270,
      cards: [
        { images: ["rummy/club_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/club_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/diamond_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/heart_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_1.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_2.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_3.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_4.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_5.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_6.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_7.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_8.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_9.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_10.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_jack.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_queen.png", "rummy/back_blue.png"] },
        { images: ["rummy/spade_king.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
        { images: ["rummy/joker_red.png", "rummy/back_blue.png"] },
      ],
    },
  ],
};

export const WIZARD: SceneConfig = {
  privateArea: { x: 30, y: 470, w: 1300, h: 300 },
  notepad: { x: 920, y: 200, w: 410, h: 250, text: "Write here." },
  avatars: [
    { x: 920, y: 30, text: "Player1" },
    { x: 1130, y: 30, text: "Player2" },
    { x: 920, y: 70, text: "Player3" },
    { x: 1130, y: 70, text: "Player4" },
    { x: 920, y: 110, text: "Player5" },
    { x: 1130, y: 110, text: "Player6" },
    { x: 920, y: 150, text: "Player7" },
    { x: 1130, y: 150, text: "Player8" },
  ],
  decks: [
    {
      x: 100,
      y: 100,
      cards: [
        { texts: ["1", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["2", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["3", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["4", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["5", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["6", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["7", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["8", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["9", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["10", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["11", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["12", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["13", ""], colors: ["lightskyblue", "lightskyblue"] },
        { texts: ["1", ""], colors: ["crimson", "crimson"] },
        { texts: ["2", ""], colors: ["crimson", "crimson"] },
        { texts: ["3", ""], colors: ["crimson", "crimson"] },
        { texts: ["4", ""], colors: ["crimson", "crimson"] },
        { texts: ["5", ""], colors: ["crimson", "crimson"] },
        { texts: ["6", ""], colors: ["crimson", "crimson"] },
        { texts: ["7", ""], colors: ["crimson", "crimson"] },
        { texts: ["8", ""], colors: ["crimson", "crimson"] },
        { texts: ["9", ""], colors: ["crimson", "crimson"] },
        { texts: ["10", ""], colors: ["crimson", "crimson"] },
        { texts: ["11", ""], colors: ["crimson", "crimson"] },
        { texts: ["12", ""], colors: ["crimson", "crimson"] },
        { texts: ["13", ""], colors: ["crimson", "crimson"] },
        { texts: ["1", ""], colors: ["gold", "gold"] },
        { texts: ["2", ""], colors: ["gold", "gold"] },
        { texts: ["3", ""], colors: ["gold", "gold"] },
        { texts: ["4", ""], colors: ["gold", "gold"] },
        { texts: ["5", ""], colors: ["gold", "gold"] },
        { texts: ["6", ""], colors: ["gold", "gold"] },
        { texts: ["7", ""], colors: ["gold", "gold"] },
        { texts: ["8", ""], colors: ["gold", "gold"] },
        { texts: ["9", ""], colors: ["gold", "gold"] },
        { texts: ["10", ""], colors: ["gold", "gold"] },
        { texts: ["11", ""], colors: ["gold", "gold"] },
        { texts: ["12", ""], colors: ["gold", "gold"] },
        { texts: ["13", ""], colors: ["gold", "gold"] },
        { texts: ["1", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["2", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["3", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["4", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["5", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["6", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["7", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["8", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["9", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["10", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["11", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["12", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["13", ""], colors: ["darkseagreen", "darkseagreen"] },
        { texts: ["N", ""], colors: ["snow", "snow"] },
        { texts: ["N", ""], colors: ["snow", "snow"] },
        { texts: ["N", ""], colors: ["snow", "snow"] },
        { texts: ["N", ""], colors: ["snow", "snow"] },
        { texts: ["Z", ""], colors: ["snow", "snow"] },
        { texts: ["Z", ""], colors: ["snow", "snow"] },
        { texts: ["Z", ""], colors: ["snow", "snow"] },
        { texts: ["Z", ""], colors: ["snow", "snow"] },
      ],
    },
  ],
};

export class GameConfig {
  constructor(
    private config: SceneConfig,
    private boardId: string,
    private gameId: string
  ) {
    // TODO: This should be part of scene.
    // Scene should be able to instantiate (hydrate) itself from
    // SceneConfig and serialize (dehydrate) itself back to SceneConfig.
  }

  hydrate(): ReplicatedScene {
    const scene: ReplicatedScene = {
      tick: 0,
      boardId: this.boardId,
      gameId: this.gameId,
      playerId: "",
      clientId: "",
      boards: {},
      marbles: {},
      avatars: {},
      notepads: {},
      privateAreas: {},
      decks: {},
      cards: {},
    };

    const board = this.config.board;
    if (board) {
      scene.boards["board-1"] = {
        tick: 0,
        owner: null,
        x: board.x,
        y: board.y,
        z: 0,
        w: board.w,
        h: board.h,
        image: board.image,
      };
    }

    const privateArea = this.config.privateArea;
    if (privateArea) {
      scene.privateAreas["privateArea-1"] = {
        tick: 0,
        owner: null,
        x: privateArea.x,
        y: privateArea.y,
        z: 0,
        w: privateArea.w,
        h: privateArea.h,
      };
    }

    const notepad = this.config.notepad;
    if (notepad) {
      scene.notepads["notepad-1"] = {
        tick: 0,
        owner: null,
        x: notepad.x,
        y: notepad.y,
        z: 0,
        w: notepad.w,
        h: notepad.h,
        text: notepad.text,
      };
    }

    const avatars = this.config.avatars;
    if (avatars) {
      for (let i = 0; i < avatars.length; i++) {
        const avatar = avatars[i];
        if (!avatar) {
          continue;
        }
        const avatarName = "avatar-" + i.toString();
        scene.avatars[avatarName] = {
          tick: 0,
          owner: null,
          x: avatar.x,
          y: avatar.y,
          z: 0,
          w: 200,
          h: 30,
          color: "",
          represents: null,
          text: avatar.text,
        };
      }
    }

    const marbles = this.config.marbles;
    if (marbles) {
      for (let i = 0; i < marbles.length; i++) {
        const marble = marbles[i];
        if (!marble) {
          continue;
        }
        scene.marbles["marble-" + i.toString()] = {
          tick: 0,
          owner: null,
          x: marble.x,
          y: marble.y,
          z: 0,
          w: 20,
          h: 20,
          color: marble.color,
        };
      }
    }

    const decks = this.config.decks;
    if (decks) {
      for (let i = 0; i < decks.length; i++) {
        const deck = decks[i];
        if (!deck) {
          continue;
        }
        const deckName = "deck-" + i.toString();
        scene.decks[deckName] = {
          tick: 0,
          owner: null,
          x: deck.x,
          y: deck.y,
          z: 0,
          w: 30,
          h: 150,
          strides: [2, 20],
          current: 0,
        };

        for (let j = 0; j < deck.cards.length; j++) {
          const card = deck.cards[j];
          if (!card) {
            continue;
          }
          const cardName = "card-" + i.toString() + "-" + j.toString();
          if ("images" in card) {
            scene.cards[cardName] = {
              tick: 0,
              owner: null,
              x: j,
              y: 0,
              z: 0,
              w: 100,
              h: 150,
              onDeck: deckName,
              texts: [],
              colors: [],
              images: card.images,
              current: 0,
            };
          } else {
            scene.cards[cardName] = {
              tick: 0,
              owner: null,
              x: j,
              y: 0,
              z: 0,
              w: 100,
              h: 150,
              onDeck: deckName,
              texts: card.texts,
              colors: card.colors,
              images: [],
              current: 0,
            };
          }
        }
      }
    }
    return scene;
  }
}
