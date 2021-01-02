"use strict";

/*
  Constants
*/

const MINIMUM_OVERLAP = 500;
const DECK_Z_DEPTH = 200;
const PLAYING_BOARD = "PlayingBoard";
const MARBLE = "Marble";
const DICE = "Dice";
const TEXT_AREA = "TextArea";
const PLAYER_CURSOR = "PlayerCursor";
const THIS_PLAYER_CURSOR = "ThisPlayerCursor";
const OTHER_PLAYER_CURSOR = "OtherPlayerCursor";
const NO_PLAYER_CURSOR = "NoPlayerCursor";
const PLAYER_TAG = "PlayerTag";
const THIS_PLAYER_AVATAR = "ThisPlayerAvatar";
const OTHER_PLAYER_AVATAR = "OtherPlayerAvatar";
const NO_PLAYER_AVATAR = "NoPlayerAvatar";
const PLAYER_AVATAR = "PlayerAvatar";
const PRIVATE_AREA = "PrivateArea";
const PLAYING_CARD = "PlayingCard";
const MOVE_DECK_CONTROL = "MoveDeckControl";
const SHUFFLE_DECK_CONTROL = "ShuffleDeckControl";
const FOLD_DECK_CONTROL = "FoldDeckControl";
const TURN_DECK_CONTROL = "TurnDeckControl";

/*
  Global State
*/

let _websocket = null;
let _drag = null;
let _boardId = null;
let _gameId = null;
let _playerId = null;
let _gameTicks = 0;
let _serverScene = {};
let _clientScene = {};
let _diffToServer = {};
let _cachedPlayerAvatarIds = {};

/*
 ____  _             _             ____                      _
|  _ \| | __ _ _   _(_)_ __   __ _| __ )  ___   __ _ _ __ __| |
| |_) | |/ _` | | | | | '_ \ / _` |  _ \ / _ \ / _` | '__/ _` |
|  __/| | (_| | |_| | | | | | (_| | |_) | (_) | (_| | | | (_| |
|_|   |_|\__,_|\__, |_|_| |_|\__, |____/ \___/ \__,_|_|  \__,_|
               |___/         |___/
*/

function createEditablePlayingBoard() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("PlayingBoard" + i) === false) {
      thingId = "PlayingBoard" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: _gameTicks,
    ownedBy: _playerId,
    behavesAs: PLAYING_BOARD,
    canBeEdited: true,
    image: "boards/dog8.png",
    top: 0,
    left: 0,
    width: 400,
    height: 400,
    zIndex: 0,
  };
}

function renderPlayingBoard(thingId) {
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("div");

    // DOM properties
    element.id = thingId;
    element.className = PLAYING_BOARD;

    document.body.appendChild(element);
  }

  const thing = _clientScene[thingId];

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;
  element.style.backgroundImage = "url(" + thing.image + ")";
  element.style.backgroundSize =
    thing.computedWidth + "px " + thing.computedHeight + "px";
}

/*
 __  __            _     _
|  \/  | __ _ _ __| |__ | | ___
| |\/| |/ _` | '__| '_ \| |/ _ \
| |  | | (_| | |  | |_) | |  __/
|_|  |_|\__,_|_|  |_.__/|_|\___|
*/

function createEditableMarble() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("Marble" + i) === false) {
      thingId = "Marble" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: _gameTicks,
    ownedBy: _playerId,
    behavesAs: MARBLE,
    canBeEdited: true,
    backgroundColor: "snow",
    top: 0,
    left: 0,
    width: 400,
    height: 400,
    zIndex: 0,
  };
}

function renderMarble(thingId) {
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("div");

    // DOM properties
    element.id = thingId;
    element.className = MARBLE;
    element.onmousedown = onMouseDown;

    document.body.appendChild(element);
  }

  const thing = _clientScene[thingId];

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;
  element.style.backgroundColor = thing.backgroundColor;
}

function moveMarble(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left;
}

/*
 ____  _
|  _ \(_) ___ ___
| | | | |/ __/ _ \
| |_| | | (_|  __/
|____/|_|\___\___|
*/

function createEditableDice() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("Dice" + i) === false) {
      thingId = "Dice" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: 0,
    ownedBy: null,
    behavesAs: "Dice",
    canBeEdited: true,
    sides: [
      "dices/dice6_side1.png",
      "dices/dice6_side2.png",
      "dices/dice6_side3.png",
      "dices/dice6_side4.png",
      "dices/dice6_side5.png",
      "dices/dice6_side6.png",
    ],
    sideUp: 0,
    top: 30,
    left: 830,
    height: 50,
    width: 50,
    zIndex: 0,
  };
}

function renderDice(thingId) {
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("div");

    // DOM properties
    element.id = thingId;
    element.className = DICE;
    element.onmousedown = onMouseDown;

    document.body.appendChild(element);
  }

  const thing = _clientScene[thingId];

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;
  element.style.backgroundImage = "url(" + thing.sides[thing.sideUp] + ")";
  element.style.backgroundSize =
    thing.computedWidth + "px " + thing.computedHeight + "px";
}

function moveDice(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left;
}

function rollDice(thingId) {
  _clientScene[thingId].sideUp = Math.floor(
    Math.random() * _clientScene[thingId].sides.length
  );
}

/*
 ____  _                        _             _
|  _ \| | __ _ _   _  ___ _ __ / \__   ____ _| |_ __ _ _ __
| |_) | |/ _` | | | |/ _ | '__/ _ \ \ / / _` | __/ _` | '__|
|  __/| | (_| | |_| |  __| | / ___ \ V | (_| | || (_| | |
|_|   |_|\__,_|\__, |\___|_|/_/   \_\_/ \__,_|\__\__,_|_|
               |___/
*/

function createEditablePlayerAvatar() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("PlayerAvatar" + i) === false) {
      thingId = "PlayerAvatar" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: 0,
    ownedBy: null,
    behavesAs: "PlayerAvatar",
    canBeEdited: true,
    represents: null,
    text: "Player1",
    top: 30,
    left: 920,
    height: 30,
    width: 200,
    zIndex: 0,
    cursorTop: 0,
    cursorLeft: 0,
  };
}

function renderPlayerAvatar(thingId) {
  const thing = _clientScene[thingId];

  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("textarea");
    element.id = thingId;
    element.value = thing.text;
    element.onkeyup = onKeyUp;

    document.body.appendChild(element);
  }

  let cursorElement = document.getElementById(thingId + PLAYER_CURSOR);
  if (cursorElement === null) {
    cursorElement = document.createElement("div");
    cursorElement.id = thingId + PLAYER_CURSOR;
    document.body.appendChild(cursorElement);
  }

  if (_clientScene[thingId].represents === _playerId) {
    cursorElement.className = THIS_PLAYER_CURSOR;
    element.className = THIS_PLAYER_AVATAR;
    element.disabled = false;
  } else if (_clientScene[thingId].represents !== null) {
    cursorElement.className = OTHER_PLAYER_CURSOR;
    element.className = OTHER_PLAYER_AVATAR;
    element.disabled = true;
  } else if (_clientScene[thingId].represents === null) {
    cursorElement.className = NO_PLAYER_CURSOR;
    element.className = NO_PLAYER_AVATAR;
    element.disabled = true;
  }

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    // Easier to understand condition than a negation
  } else {
    element.value = thing.text;
  }

  cursorElement.style.top = thing.cursorTop;
  cursorElement.style.left = thing.cursorLeft;
  cursorElement.style.zIndex = thing.computedZIndex;
  cursorElement.innerHTML = thing.text;
}

function editPlayerAvatar(thingId, text) {
  if (_clientScene[thingId].represents === _playerId) {
    _clientScene[thingId].text = text;
  }
}

function moveCursor(thingId, left, top) {
  _clientScene[thingId].cursorLeft = left;
  _clientScene[thingId].cursorTop = top;
}

/*
 _____         _      _
|_   ______  _| |_   / \   _ __ ___  __ _
  | |/ _ \ \/ | __| / _ \ | '__/ _ \/ _` |
  | |  __/>  <| |_ / ___ \| | |  __| (_| |
  |_|\___/_/\_\\__/_/   \_|_|  \___|\__,_|
*/

function createEditableTextArea() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("TextArea" + i) === false) {
      thingId = "TextArea" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: 0,
    ownedBy: null,
    canBeEdited: true,
    behavesAs: TEXT_AREA,
    text: "Hello World",
    top: 200,
    left: 1130,
    height: 250,
    width: 200,
    zIndex: 0,
  };
}

function renderTextArea(thingId) {
  const thing = _clientScene[thingId];
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("textarea");

    // DOM properties
    element.id = thingId;
    element.className = TEXT_AREA;
    element.value = thing.text;
    element.onkeyup = onKeyUp;

    // Player Avatar tag
    const tagElem = document.createElement("div");
    tagElem.className = PLAYER_TAG;

    element.appendChild(tagElem);
    document.body.appendChild(element);
  }

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    element.disabled = false;
    element.childNodes[0].style.visibility = "hidden";
  } else {
    element.value = thing.text;
    element.disabled = true;
    element.childNodes[0].style.visibility = "visible";
    element.childNodes[0].innerHTML = _clientScene[thingId].ownedBy;
  }
}

function editTextArea(thingId, text) {
  _clientScene[thingId].text = text;
}

/*
 ____       _            _          _
|  _ \ _ __(___   ____ _| |_ ___   / \   _ __ ___  __ _
| |_) | '__| \ \ / / _` | __/ _ \ / _ \ | '__/ _ \/ _` |
|  __/| |  | |\ V | (_| | ||  __// ___ \| | |  __| (_| |
|_|   |_|  |_| \_/ \__,_|\__\___/_/   \_|_|  \___|\__,_|
*/

function createEditablePrivateArea() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("PrivateArea" + i) === false) {
      thingId = "PrivateArea" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: 0,
    ownedBy: null,
    behavesAs: PRIVATE_AREA,
    canBeEdited: true,
    top: 470,
    left: 830,
    height: 300,
    width: 500,
    zIndex: 0,
  };
}

function renderPrivateArea(thingId) {
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("div");

    // DOM properties
    element.id = thingId;
    element.className = PRIVATE_AREA;

    document.body.appendChild(element);
  }

  const thing = _clientScene[thingId];

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;
}

/*
 ____  _             _              ____              _
|  _ \| | __ _ _   _(_)_ __   __ _ / ___|__ _ _ __ __| |___
| |_) | |/ _` | | | | | '_ \ / _` | |   / _` | '__/ _` / __|
|  __/| | (_| | |_| | | | | | (_| | |__| (_| | | | (_| \__ \
|_|   |_|\__,_|\__, |_|_| |_|\__, |\____\__,_|_|  \__,_|___/
               |___/         |___/
*/

// TODO: Cards are dices that can be stacked and have two sides
// with and a [0 1; 1 0] transition probability matrix.

function createEditableCard() {
  let thingId = null;
  for (let i = 0; i < 100; i++) {
    if (_clientScene.hasOwnProperty("Card" + i) === false) {
      thingId = "Card" + i;
      break;
    }
  }

  console.assert(thingId !== null);

  _clientScene[thingId] = {
    upToTick: 0,
    ownedBy: null,
    behavesAs: "PlayingCard",
    canBeEdited: true,
    faceImage: "rummy/club_1.png",
    backImage: "rummy/back_red.png",
    isFaceup: true,
    onDeck: null,
    isFolded: true,
    stride: 30,
    top: 270,
    left: 830,
    height: 150,
    width: 100,
    zIndex: 0,
  };
}

function findOrCreatePlayingCard(thingId) {
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("div");

    // Playing Card
    element.id = thingId;
    element.className = PLAYING_CARD;
    element.onmousedown = onMouseDown;

    // Player Avatar tag
    const tagElem = document.createElement("div");
    tagElem.className = PLAYER_TAG;

    element.appendChild(tagElem);
    document.body.appendChild(element);
  }
  return element;
}

function renderPlayingCard(thingId) {
  const element = findOrCreatePlayingCard(thingId);
  const thing = _clientScene[thingId];

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = _clientScene[thingId].width;
  element.style.height = _clientScene[thingId].height;
  element.style.zIndex = thing.computedZIndex;

  // Render face
  if (thing.isFaceup) {
    element.style.backgroundImage = "url(" + thing.faceImage + ")";
  } else {
    element.style.backgroundImage = "url(" + thing.backImage + ")";
  }
  element.style.backgroundSize =
    _clientScene[thingId].width + "px " + _clientScene[thingId].height + "px";

  // Render player tag
  if (
    _clientScene[thingId].ownedBy === null ||
    _clientScene[thingId].upToTick + 5 < _gameTicks
  ) {
    element.childNodes[0].style.visibility = "hidden";
  } else {
    element.childNodes[0].style.visibility = "visible";
    element.childNodes[0].innerHTML = _clientScene[thingId].ownedBy;
  }
}

function turnPlayingCardAround(thingId) {
  if (_clientScene[thingId].computedLeadsDeck) {
    //
  } else {
    _clientScene[thingId].isFaceup = !_clientScene[thingId].isFaceup;
  }
}

function takePlayingCard(thingId) {
  leaveCardDeck(thingId);
  _clientScene[thingId].zIndex = findCardMaxZ();
}

function movePlayingCard(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left;
}

function placePlayingCard(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left;

  const targetId = findDeckToPutCard(thingId);
  if (targetId !== null) {
    joinCardDeck(targetId, thingId);
  }
}

function findCardMaxZ() {
  // Do not use computed zIndices here otherwise
  // cards will steadily climp upwards very fast
  // Move cards on top relies on card decks never taking more than
  // DECK_Z_DEPTH z units of z space.

  let result = 0;
  for (const thingId of Object.keys(_clientScene)) {
    if (
      _clientScene[thingId].behavesAs === PLAYING_CARD &&
      _clientScene[thingId].zIndex > result
    ) {
      result = _clientScene[thingId].zIndex;
    }
  }
  return result + DECK_Z_DEPTH;
}

function findDeckToPutCard(cardId) {
  const overlapsCard = findOverlaps(cardId);

  let largest = null;
  for (const [otherId, pixels] of Object.entries(overlapsCard)) {
    if (
      _clientScene[otherId].behavesAs !== PLAYING_CARD ||
      _clientScene[otherId].onDeck === cardId
    ) {
      continue;
    }

    const overlapsOther = findOverlaps(otherId);
    let onPrivateAreaAndForeign = false;
    for (const [areaId, area] of Object.entries(_clientScene)) {
      if (
        area.behavesAs === PRIVATE_AREA &&
        overlapsOther[areaId] > MINIMUM_OVERLAP &&
        _clientScene[otherId].computedZIndex < area.computedZIndex
      ) {
        onPrivateAreaAndForeign = true;
        break;
      }
    }

    if (
      pixels > MINIMUM_OVERLAP &&
      onPrivateAreaAndForeign === false &&
      (largest === null ||
        _clientScene[otherId].computedZIndex >
          _clientScene[largest].computedZIndex)
    ) {
      largest = otherId;
    }
  }
  return largest;
}

function findOverlaps(thingId) {
  /**
   * Find overlaps with all other objects in scene
   * and return them in pixels squared and the largest.
   *
   * @returns {[thingId: number]}
   */
  const overlaps = {};

  const aElem = document.getElementById(thingId);
  const aTop = aElem.offsetTop;
  const aLeft = aElem.offsetLeft;
  const aHeight = aElem.offsetHeight;
  const aWidth = aElem.offsetWidth;

  for (const otherId of Object.keys(_clientScene)) {
    if (otherId === thingId) {
      continue;
    }

    // Phantom scene elements exist but are never
    // initialized as DOM elements.
    const bElem = document.getElementById(otherId);
    if (bElem === null) {
      continue;
    }

    const bTop = bElem.offsetTop;
    const bLeft = bElem.offsetLeft;
    const bHeight = bElem.offsetHeight;
    const bWidth = bElem.offsetWidth;

    const h = Math.min(aLeft + aWidth, bLeft + bWidth) - Math.max(aLeft, bLeft);
    const v = Math.min(aTop + aHeight, bTop + bHeight) - Math.max(aTop, bTop);

    overlaps[otherId] = Math.max(0, h) * Math.max(0, v);
  }

  return overlaps;
}

/*
  ____              _ ____            _
 / ___|__ _ _ __ __| |  _ \  ___  ___| | _____
| |   / _` | '__/ _` | | | |/ _ \/ __| |/ / __|
| |__| (_| | | | (_| | |_| |  __| (__|   <\__ \
 \____\__,_|_|  \__,_|____/ \___|\___|_|\_|___/
*/

function findOrCreateCardDeckControls(thingId) {
  let moveControl = document.getElementById(thingId + MOVE_DECK_CONTROL);
  if (moveControl === null) {
    moveControl = document.createElement("div");
    moveControl.id = thingId + MOVE_DECK_CONTROL;
    moveControl.className = MOVE_DECK_CONTROL;
    moveControl.onmousedown = onMouseDown;
    document.body.appendChild(moveControl);
  }

  let shuffleControl = document.getElementById(thingId + SHUFFLE_DECK_CONTROL);
  if (shuffleControl === null) {
    shuffleControl = document.createElement("div");
    shuffleControl.id = thingId + SHUFFLE_DECK_CONTROL;
    shuffleControl.className = SHUFFLE_DECK_CONTROL;
    shuffleControl.onclick = onMouseClick;
    document.body.appendChild(shuffleControl);
  }

  let foldControl = document.getElementById(thingId + FOLD_DECK_CONTROL);
  if (foldControl === null) {
    foldControl = document.createElement("div");
    foldControl.id = thingId + FOLD_DECK_CONTROL;
    foldControl.className = FOLD_DECK_CONTROL;
    foldControl.onclick = onMouseClick;
    document.body.appendChild(foldControl);
  }

  let turnControl = document.getElementById(thingId + TURN_DECK_CONTROL);
  if (turnControl === null) {
    turnControl = document.createElement("div");
    turnControl.id = thingId + TURN_DECK_CONTROL;
    turnControl.className = TURN_DECK_CONTROL;
    turnControl.onclick = onMouseClick;
    document.body.appendChild(turnControl);
  }

  return [moveControl, shuffleControl, foldControl, turnControl];
}

function renderCardDeckControls(thingId) {
  const card = _clientScene[thingId];
  const controlElems = findOrCreateCardDeckControls(thingId);
  for (let i = 0; i < controlElems.length; i++) {
    if (card.computedLeadsDeck) {
      controlElems[i].style.top = card.computedTop + i * 30 + "px";
      controlElems[i].style.left = card.computedLeft - 30 + "px";
      controlElems[i].style.zIndex = card.computedZIndex;
      controlElems[i].style.visibility = "visible";
    } else {
      controlElems[i].style.visibility = "hidden";
    }
  }
}

function takeCardDeck(thingId) {
  _clientScene[thingId].zIndex = findCardMaxZ();
}

function moveCardDeck(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left + 30;
}

function placeCardDeck(thingId, top, left) {
  _clientScene[thingId].top = top;
  _clientScene[thingId].left = left + 30;

  const targetId = findDeckToPutCard(thingId);

  if (targetId !== null) {
    joinCardDeck(targetId, thingId);
  }
}

function shuffleCardDeck(deckId) {
  // Do not use computed zIndices here otherwise
  // cards will steadily climp upwards very fast

  deckId = _clientScene[deckId].onDeck || deckId;
  let cardIds = recondenseCardDecks()[deckId];
  cardIds.unshift(deckId);

  let indices = [];
  for (let i = 0; i < cardIds.length; i++) {
    indices.push(i);
  }
  shuffle(indices);

  const newCards = {};
  let newLeadId = null;
  for (let i = 0; i < cardIds.length; i++) {
    const oldCardId = cardIds[i];
    const newCardId = cardIds[indices[i]];
    if (newLeadId === null) {
      newLeadId = newCardId;
      newCards[newCardId] = {
        onDeck: null,
        top: _clientScene[oldCardId].computedTop,
        left: _clientScene[oldCardId].computedLeft,
        isFolded: _clientScene[oldCardId].isFolded,
        zIndex: 0,
      };
    } else {
      newCards[newCardId] = {
        onDeck: newLeadId,
        top: _clientScene[oldCardId].top,
        left: _clientScene[oldCardId].left,
        zIndex: 0,
      };
    }
  }

  for (const [newPropId, newProps] of Object.entries(newCards)) {
    for (const [prop, key] of Object.entries(newProps)) {
      _clientScene[newPropId][prop] = key;
    }
  }
}

function turnCardDeck(deckId) {
  // Do not use computed zIndices here otherwise
  // cards will steadily climp upwards very fast

  deckId = _clientScene[deckId].onDeck || deckId;
  let cardIds = recondenseCardDecks()[deckId];
  cardIds.unshift(deckId);

  const isFaceup = !_clientScene[cardIds[0]].isFaceup;

  let newLeadId = null;
  for (let i = cardIds.length - 1; i >= 0; i--) {
    const cardId = cardIds[i];
    const card = _clientScene[cardId];
    if (newLeadId === null) {
      newLeadId = cardId;
      card.onDeck = null;
      card.left = _clientScene[cardIds[0]].computedLeft;
      card.top = _clientScene[cardIds[0]].computedTop;
      card.isFolded = _clientScene[cardIds[0]].isFolded;
      card.zIndex = 0;
      card.isFaceup = isFaceup;
    } else {
      card.onDeck = newLeadId;
      card.left = cardIds.length - i;
      card.top = 0;
      card.zIndex = 0;
      card.isFaceup = isFaceup;
    }
  }
}

function foldCardDeck(thingId) {
  _clientScene[thingId].isFolded = !_clientScene[thingId].isFolded;
}

function joinCardDeck(deckId, otherId) {
  // Reset z indices. Once a card is on a deck, its
  // z index will be computed from its position on the
  // deck either way.

  deckId = _clientScene[deckId].onDeck || deckId;
  otherId = _clientScene[otherId].onDeck || otherId;

  const deckElem = document.getElementById(deckId);
  const otherElem = document.getElementById(otherId);
  const left = otherElem.offsetLeft - deckElem.offsetLeft;

  if (left < 0) {
    joinCardDeck(otherId, deckId);
  } else {
    const allDecks = recondenseCardDecks();

    let mostLeft = 0;
    if (allDecks.hasOwnProperty(deckId)) {
      for (let i = 0; i < allDecks[deckId].length; i++) {
        if (_clientScene[allDecks[deckId][i]].left > mostLeft) {
          mostLeft = _clientScene[allDecks[deckId][i]].left;
        }
      }
    }

    _clientScene[otherId].onDeck = deckId;
    _clientScene[otherId].top = 0;
    _clientScene[otherId].left = mostLeft + 1;
    _clientScene[otherId].zIndex = 0;

    if (allDecks.hasOwnProperty(otherId)) {
      for (let i = 0; i < allDecks[otherId].length; i++) {
        const cardId = allDecks[otherId][i];
        _clientScene[cardId].onDeck = deckId;
        _clientScene[cardId].top = 0;
        _clientScene[cardId].left = mostLeft + 2 + i;
        _clientScene[cardId].zIndex = 0;
      }
    }
  }
}

function leaveCardDeck(cardId) {
  // Do not use computed zIndices here otherwise
  // cards will steadily climp upwards very fast

  const allDecks = recondenseCardDecks();

  if (allDecks.hasOwnProperty(cardId)) {
    // cardId leads a deck. Rewire all cards to new lead.
    const deck = allDecks[cardId];

    _clientScene[deck[0]].onDeck = null;
    _clientScene[deck[0]].top = _clientScene[deck[0]].computedTop;
    _clientScene[deck[0]].left = _clientScene[deck[0]].computedLeft;
    _clientScene[deck[0]].isFolded = _clientScene[cardId].isFolded;
    _clientScene[deck[0]].zIndex = 0;

    for (let i = 1; i < deck.length; i++) {
      _clientScene[deck[i]].onDeck = deck[0];
    }
  }

  _clientScene[cardId].onDeck = null;
  _clientScene[cardId].top = _clientScene[cardId].computedTop;
  _clientScene[cardId].left = _clientScene[cardId].computedLeft;
  _clientScene[cardId].isFolded = false;
  _clientScene[cardId].zIndex = 0;
}

function shuffle(a) {
  // by Jeff -- https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}

function recondenseCardDecks() {
  /**
   * Collect decks in the clientScene and return them left to right.
   *
   * @return {[cardId: [cardId]]}
   */
  const decks = {};

  for (const [thingId, thing] of Object.entries(_clientScene)) {
    if (thing.behavesAs === PLAYING_CARD && thing.onDeck !== null) {
      if (decks.hasOwnProperty(thing.onDeck)) {
        decks[thing.onDeck].push(thingId);
      } else {
        decks[thing.onDeck] = [thingId];
      }
    }
  }

  for (const [deckId, cardIds] of Object.entries(decks)) {
    cardIds.sort((a, b) => _clientScene[a].left - _clientScene[b].left);
  }

  return decks;
}

/*
 _____    _ _ _    ____            _             _
| ____|__| (_| |_ / ___|___  _ __ | |_ _ __ ___ | |___
|  _| / _` | | __| |   / _ \| '_ \| __| '__/ _ \| / __|
| |__| (_| | | |_| |__| (_) | | | | |_| | | (_) | \__ \
|_____\__,_|_|\__|\____\___/|_| |_|\__|_|  \___/|_|___/
*/

function renderModifyBackgroundControls(thingId) {
  const thing = _clientScene[thingId];
  let element = document.getElementById(thingId + "ModifyBackground");
  if (element === null) {
    element = document.createElement("textarea");
    element.id = thingId + "ModifyBackground";
    element.onkeyup = onKeyUp;
    element.className = "ModifyBackground";
    element.value = thing.backgroundColor;
    element.style.position = "absolute";
    document.body.appendChild(element);
  }

  element.style.top = thing.computedTop + 60 + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.zIndex = thing.zIndex + 1;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    element.disabled = false;
  } else {
    element.value = thing.text;
    element.disabled = true;
  }
}

function modifyBackground(thingId, text) {
  _clientScene[thingId].backgroundColor = text;
}

function renderModifyImageControls(thingId) {
  const thing = _clientScene[thingId];
  let element = document.getElementById(thingId + "ModifyImage");
  if (element === null) {
    element = document.createElement("textarea");
    element.id = thingId + "ModifyImage";
    element.onkeyup = onKeyUp;
    element.className = "ModifyImage";
    element.innerHTML = thing.image;
    element.style.position = "absolute";
    document.body.appendChild(element);
  }

  element.style.top = thing.computedTop + 50 + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.zIndex = thing.zIndex + 1;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    element.disabled = false;
  } else {
    element.value = thing.text;
    element.disabled = true;
  }
}

function modifyImage(thingId, text) {
  _clientScene[thingId].image = text;
}

function renderTransformControls(thingId) {
  const thing = _clientScene[thingId];
  let moveControl = document.getElementById(thingId + "MoveControl");
  if (moveControl === null) {
    moveControl = document.createElement("div");
    moveControl.id = thingId + "MoveControl";
    moveControl.onmousedown = onMouseDown;
    moveControl.className = "MoveControl";
    moveControl.innerHTML = thing.behavesAs;
    moveControl.style.userSelect = "none";
    moveControl.style.position = "absolute";
    moveControl.style.borderWidth = "1px";
    moveControl.style.borderStyle = "solid none none solid";
    moveControl.style.borderColor = "black";
    moveControl.style.backgroundColor = "snow";
    document.body.appendChild(moveControl);
  }

  let resizeControl = document.getElementById(thingId + "ResizeControl");
  if (resizeControl === null) {
    resizeControl = document.createElement("div");
    resizeControl.id = thingId + "ResizeControl";
    resizeControl.onmousedown = onMouseDown;
    resizeControl.className = "ResizeControl";
    resizeControl.style.userSelect = "none";
    resizeControl.style.position = "absolute";
    resizeControl.style.width = "30px";
    resizeControl.style.height = "30px";
    resizeControl.style.borderWidth = "1px";
    resizeControl.style.borderStyle = "none solid solid none";
    resizeControl.style.borderColor = "black";
    resizeControl.style.backgroundColor = "snow";
    document.body.appendChild(resizeControl);
  }

  moveControl.style.top = thing.computedTop + "px";
  moveControl.style.left = thing.computedLeft + "px";
  moveControl.style.zIndex = thing.computedZIndex + 1;

  resizeControl.style.top =
    thing.computedTop + thing.computedHeight - 30 + "px";
  resizeControl.style.left =
    thing.computedLeft + thing.computedWidth - 30 + "px";
  resizeControl.style.zIndex = thing.computedZIndex + 1;
}

function resizeEditableThing(thingId, top, left) {
  const thing = _clientScene[thingId];
  if (thing.canBeEdited === false) {
    return;
  }

  thing.height = top - thing.computedTop + 30;
  thing.width = left - thing.computedLeft + 30;
}

function moveEditableThing(thingId, top, left) {
  const thing = _clientScene[thingId];
  if (thing.canBeEdited === false) {
    return;
  }

  thing.top = top;
  thing.left = left;
}

function renderModifySidesControls(thingId) {
  const thing = _clientScene[thingId];
  let element = document.getElementById(thingId + "ModifySides");
  if (element === null) {
    element = document.createElement("textarea");
    element.id = thingId + "ModifySides";
    element.onkeyup = onKeyUp;
    element.className = "ModifySides";
    element.value = JSON.stringify(thing.sides, null, "  ");
    element.style.position = "absolute";
    document.body.appendChild(element);
  }

  element.style.top = thing.computedTop + 60 + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.zIndex = thing.zIndex + 1;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    element.disabled = false;
  } else {
    element.value = JSON.stringify(thing.sides, null, "  ");
    element.disabled = true;
  }
}

function modifySides(thingId, text) {
  _clientScene[thingId].sides = JSON.parse(text);
}

function renderModifyFaceControls(thingId) {
  const thing = _clientScene[thingId];
  let faceText = document.getElementById(thingId + "ModifyFaceImage");
  if (faceText === null) {
    faceText = document.createElement("textarea");
    faceText.id = thingId + "ModifyFaceImage";
    faceText.onkeyup = onKeyUp;
    faceText.className = "ModifyFaceImage";
    faceText.value = thing.faceImage;
    faceText.style.position = "absolute";
    document.body.appendChild(faceText);
  }

  let backText = document.getElementById(thingId + "ModifyBackImage");
  if (backText === null) {
    backText = document.createElement("textarea");
    backText.id = thingId + "ModifyBackImage";
    backText.onkeyup = onKeyUp;
    backText.className = "ModifyBackImage";
    backText.value = thing.backImage;
    backText.style.position = "absolute";
    document.body.appendChild(backText);
  }

  faceText.style.top = thing.computedTop + 30 + "px";
  faceText.style.left = thing.computedLeft + "px";
  faceText.style.zIndex = thing.computedZIndex + 1;

  backText.style.top = thing.computedTop + 90 + "px";
  backText.style.left = thing.computedLeft + "px";
  backText.style.zIndex = thing.computedZIndex + 1;

  if (
    thing.ownedBy === null ||
    thing.ownedBy === _playerId ||
    thing.upToTick + 5 < _gameTicks
  ) {
    faceText.disabled = false;
    backText.disabled = false;
  } else {
    faceText.value = thing.faceImage;
    faceText.disabled = true;
    backText.value = thing.faceImage;
    backText.disabled = true;
  }
}

function modifyFaceImage(thingId, text) {
  _clientScene[thingId].faceImage = text;
}

function modifyBackImage(thingId, text) {
  _clientScene[thingId].backImage = text;
}

/*
 ____                   _                     _          _   _
/ ___| _   _ _ __   ___| |__  _ __ ___  _ __ (_)______ _| |_(_) ___  _ __
\___ \| | | | '_ \ / __| '_ \| '__/ _ \| '_ \| |_  / _` | __| |/ _ \| '_ \
 ___) | |_| | | | | (__| | | | | | (_) | | | | |/ | (_| | |_| | (_) | | | |
|____/ \__, |_| |_|\___|_| |_|_|  \___/|_| |_|_/___\__,_|\__|_|\___/|_| |_|
       |___/
*/

/* TODO:
- Enitity component system with state being

> {"synchronized": {id1: {owners: p1, clock: [1, 2]}},
> "visible": {id1: {text: "Hello"}, id2: {image: ".png"}},
> "movable": {id1: {x: 0, y: 0}, id2: {x: 1, y:1}},
> "turnable": {dice1: {images: [1, 2, 3]}, card4: {images: [1, 2]}}
> "stacking": {deck1: {0.1: card1, 0.9: card2, 0.07: card3}}
> "editable": {id1: true, id2: false}}

- and projections computed on basis of, e.g. stacking:

> {"overlaps": {(id1, id2): 10, (id1, id3): 0},
> "movable": {card1ondeck1: {x: 0 + 1, y: 0 + 0}}}

- and a proper convergent replicated data type for synchronization.
*/

function render() {
  // Rest difference to server
  _diffToServer = {};

  for (const thingId of Object.keys(_serverScene)) {
    // Create scene object if it does not exist yet
    if (_clientScene.hasOwnProperty(thingId) === false) {
      _clientScene[thingId] = {};
    }

    // Determine if clientScene changed w.r.t. serverScene and
    // whether such change is allowed at all.
    if (
      _serverScene[thingId].ownedBy === null ||
      _serverScene[thingId].ownedBy === _playerId ||
      _serverScene[thingId].upToTick + 5 < _gameTicks
    ) {
      for (const prop of Object.keys(_clientScene[thingId])) {
        if (
          prop !== "ownedBy" &&
          prop !== "upToTick" &&
          _clientScene[thingId][prop] !== _serverScene[thingId][prop]
        ) {
          _clientScene[thingId].ownedBy = _playerId;
          _clientScene[thingId].upToTick = _gameTicks + 1;
          break;
        }
      }
    }

    // Save any allowed differences to server for later sending and
    // revert any dis-allowed differences to server.
    if (_serverScene[thingId].upToTick < _clientScene[thingId].upToTick) {
      _diffToServer[thingId] = {};
      for (const prop of Object.keys(_clientScene[thingId])) {
        _diffToServer[thingId][prop] = _clientScene[thingId][prop];
      }
    } else {
      for (const [prop, value] of Object.entries(_serverScene[thingId])) {
        _clientScene[thingId][prop] = value;
      }
    }
  }

  // Synchronize new objects from client to server
  for (const thingId of Object.keys(_clientScene)) {
    if (_serverScene.hasOwnProperty(thingId) === false) {
      _clientScene[thingId].ownedBy = _playerId;
      _clientScene[thingId].upToTick = _gameTicks + 1;
      _diffToServer[thingId] = {};
      for (const prop of Object.keys(_clientScene[thingId])) {
        _diffToServer[thingId][prop] = _clientScene[thingId][prop];
      }
    }
  }

  // Cache player avatars
  for (const [thingId, thing] of Object.entries(_clientScene)) {
    if (thing.behavesAs === PLAYER_AVATAR) {
      _cachedPlayerAvatarIds[thing.represents] = thingId;
    }
  }

  // Compute positions for all cards
  for (const [thingId, thing] of Object.entries(_clientScene)) {
    if (thing.behavesAs === PLAYING_CARD) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = thing.zIndex;
      thing.computedLeadsDeck = false;
    }
  }

  // Place private areas above all non-player owned cards
  let privateAreaZIndex = 0;
  for (const [cardId, card] of Object.entries(_clientScene)) {
    if (
      card.behavesAs === PLAYING_CARD &&
      card.ownedBy !== _playerId &&
      card.computedZIndex > privateAreaZIndex
    ) {
      privateAreaZIndex = card.computedZIndex;
    }
  }
  privateAreaZIndex += DECK_Z_DEPTH;

  for (const [areaId, area] of Object.entries(_clientScene)) {
    if (area.behavesAs === PRIVATE_AREA) {
      area.computedTop = area.top;
      area.computedLeft = area.left;
      area.computedHeight = area.height;
      area.computedWidth = area.width;
      area.computedZIndex = privateAreaZIndex;
    }
  }

  // Place all player owned cards above private areas
  for (const [cardId, card] of Object.entries(_clientScene)) {
    if (card.behavesAs === PLAYING_CARD && card.ownedBy === _playerId) {
      card.computedZIndex += privateAreaZIndex;
    }
  }

  // Compute position of cards within decks
  const computedDecks = recondenseCardDecks();
  for (const [deckId, deckCardIds] of Object.entries(computedDecks)) {
    const leadCard = _clientScene[deckId];
    // Derived properties already computed above
    leadCard.computedLeadsDeck = true;

    let accum = 0;
    for (let i = 0; i < deckCardIds.length; i++) {
      const deckCard = _clientScene[deckCardIds[i]];
      if (leadCard.isFolded) {
        accum += 2;
      } else {
        accum += deckCard.stride;
      }

      deckCard.computedTop = leadCard.computedTop;
      deckCard.computedLeft = leadCard.computedLeft + accum;
      deckCard.computedZIndex = leadCard.computedZIndex + 1 + i;
    }
  }

  // Compute highest card position after placing on private area
  let topCardZIndex = 0;
  for (const [cardId, card] of Object.entries(_clientScene)) {
    if (
      card.behavesAs === PLAYING_CARD &&
      card.computedZIndex > topCardZIndex
    ) {
      topCardZIndex = card.computedZIndex;
    }
  }
  topCardZIndex += 1;

  // Place all remaining things above all cards but the playing board.
  for (const [thingId, thing] of Object.entries(_clientScene)) {
    if (thing.behavesAs === TEXT_AREA) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = topCardZIndex + thing.zIndex;
    }
    if (thing.behavesAs === PLAYER_AVATAR) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = topCardZIndex + thing.zIndex;
    }
    if (thing.behavesAs === DICE) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = topCardZIndex + thing.zIndex;
    }
    if (thing.behavesAs === MARBLE) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = topCardZIndex + thing.zIndex;
    }
    if (thing.behavesAs === PLAYING_BOARD) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
      thing.computedHeight = thing.height;
      thing.computedWidth = thing.width;
      thing.computedZIndex = thing.zIndex;
    }
  }

  // Render
  for (const thingId of Object.keys(_clientScene)) {
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      renderPlayingCard(thingId);
      renderCardDeckControls(thingId);
    }
    if (_clientScene[thingId].behavesAs === PRIVATE_AREA) {
      renderPrivateArea(thingId);
    }
    if (_clientScene[thingId].behavesAs === TEXT_AREA) {
      renderTextArea(thingId);
    }
    if (_clientScene[thingId].behavesAs === PLAYER_AVATAR) {
      renderPlayerAvatar(thingId);
    }
    if (_clientScene[thingId].behavesAs === DICE) {
      renderDice(thingId);
    }
    if (_clientScene[thingId].behavesAs === MARBLE) {
      renderMarble(thingId);
    }
    if (_clientScene[thingId].behavesAs === PLAYING_BOARD) {
      renderPlayingBoard(thingId);
    }
    if (
      _clientScene[thingId].canBeEdited === true &&
      _clientScene[thingId].hasOwnProperty("top") &&
      _clientScene[thingId].hasOwnProperty("left") &&
      _clientScene[thingId].hasOwnProperty("height") &&
      _clientScene[thingId].hasOwnProperty("width")
    ) {
      renderTransformControls(thingId);
    }
    if (
      _clientScene[thingId].canBeEdited === true &&
      _clientScene[thingId].hasOwnProperty("image")
    ) {
      renderModifyImageControls(thingId);
    }
    if (
      _clientScene[thingId].canBeEdited === true &&
      _clientScene[thingId].hasOwnProperty("backgroundColor")
    ) {
      renderModifyBackgroundControls(thingId);
    }
    if (
      _clientScene[thingId].canBeEdited === true &&
      _clientScene[thingId].hasOwnProperty("sides")
    ) {
      renderModifySidesControls(thingId);
    }
    if (
      _clientScene[thingId].canBeEdited === true &&
      _clientScene[thingId].hasOwnProperty("faceImage") &&
      _clientScene[thingId].hasOwnProperty("backImage")
    ) {
      renderModifyFaceControls(thingId);
    }
  }
}

/*
 ___                   _   ____             _   _
|_ _|_ __  _ __  _   _| |_|  _ \ ___  _   _| |_(_)_ __   __ _
 | || '_ \| '_ \| | | | __| |_) / _ \| | | | __| | '_ \ / _` |
 | || | | | |_) | |_| | |_|  _ | (_) | |_| | |_| | | | | (_| |
|___|_| |_| .__/ \__,_|\__|_| \_\___/ \__,_|\__|_|_| |_|\__, |
          |_|                                           |___/

  InputRouting

  Movement always continues, even if we cannot access
  the thing. It makes the logic simpler at negilibile performance cost.
*/

// BUG: DOM may desynchronize with _clientScene. An input is fired
// for DOM elements that would be different after an update.

function onMouseClick(event) {
  // event.preventDefault();

  const thingId = event.target.id;

  if (thingId === "CreateEditablePlayingBoard") {
    createEditablePlayingBoard();
  }
  if (thingId === "CreateEditableMarble") {
    createEditableMarble();
  }
  if (thingId === "CreateEditableDice") {
    createEditableDice();
  }
  if (thingId === "CreateEditablePrivateArea") {
    createEditablePrivateArea();
  }
  if (thingId === "CreateEditablePlayerAvatar") {
    createEditablePlayerAvatar();
  }
  if (thingId === "CreateEditableCard") {
    createEditableCard();
  }
  if (thingId === "CreateEditableTextArea") {
    createEditableTextArea();
  }
  if (thingId.endsWith(SHUFFLE_DECK_CONTROL)) {
    shuffleCardDeck(thingId.slice(0, -SHUFFLE_DECK_CONTROL.length));
  }
  if (thingId.endsWith(TURN_DECK_CONTROL)) {
    turnCardDeck(thingId.slice(0, -TURN_DECK_CONTROL.length));
  }
  if (thingId.endsWith(FOLD_DECK_CONTROL)) {
    foldCardDeck(thingId.slice(0, -FOLD_DECK_CONTROL.length));
  }

  window.requestAnimationFrame(render);
}

function onMouseDown(event) {
  /* TODO
  - dragAndDropOnMoves(element, this, ["top", "left"]); 
  registers the proper DOM callbacks and calls back the right class functions. Allieviates the need to write
  a handler for each element. Or keep a {"canBeMoved": ...} in the projected scene graph which one single
  handler iterates through. Probably more intuitive.
  */

  // event.preventDefault();

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;

  _drag = {
    target: event.target,
    targetTop: event.target.offsetTop,
    targetLeft: event.target.offsetLeft,
    startY: clientY,
    startX: clientX,
    wasOutside: false,
  };

  const thingId = _drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    takeCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length));
  }

  if (_clientScene.hasOwnProperty(thingId)) {
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      takePlayingCard(thingId);
    }
  }

  window.requestAnimationFrame(render);
}

function onMouseMove(event) {
  // event.preventDefault();

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;

  if (_cachedPlayerAvatarIds.hasOwnProperty(_playerId)) {
    moveCursor(_cachedPlayerAvatarIds[_playerId], clientX, clientY);
  }

  // Do not require a animation frame render after just moving the
  // without an object being actively dragged. It is not necessary,
  // i.e. we do not render our own cursor, and the performance suffers
  // greatly.

  if (_drag === null) {
    return;
  }

  const top = _drag.targetTop - _drag.startY + clientY;
  const left = _drag.targetLeft - _drag.startX + clientX;
  const isOutside =
    Math.abs(_drag.startY - event.clientY) +
      Math.abs(_drag.startX - event.clientX) >
    50;

  _drag.wasOutside = _drag.wasOutside || isOutside;

  const thingId = _drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    moveCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length), top, left);
  }

  if (thingId.endsWith("ResizeControl")) {
    resizeEditableThing(thingId.slice(0, -"ResizeControl".length), top, left);
  }
  if (thingId.endsWith("MoveControl")) {
    moveEditableThing(thingId.slice(0, -"MoveControl".length), top, left);
  }

  if (_clientScene.hasOwnProperty(thingId)) {
    if (_clientScene[thingId].behavesAs == PLAYING_CARD) {
      movePlayingCard(thingId, top, left);
    }
    if (_clientScene[thingId].behavesAs === DICE) {
      moveDice(thingId, top, left);
    }
    if (_clientScene[thingId].behavesAs === MARBLE) {
      moveMarble(thingId, top, left);
    }
  }

  window.requestAnimationFrame(render);
}

function onMouseUp(event) {
  // event.preventDefault();

  if (_drag === null) {
    return;
  }

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;
  const top = _drag.targetTop - _drag.startY + clientY;
  const left = _drag.targetLeft - _drag.startX + clientX;
  const isOutside =
    Math.abs(_drag.startY - event.clientY) +
      Math.abs(_drag.startX - event.clientX) >
    50;

  _drag.wasOutside = _drag.wasOutside || isOutside;

  const thingId = _drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    placeCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length), top, left);
  }

  if (thingId.endsWith("ResizeControl")) {
    resizeEditableThing(thingId.slice(0, -"ResizeControl".length), top, left);
  }
  if (thingId.endsWith("MoveControl")) {
    moveEditableThing(thingId.slice(0, -"MoveControl".length), top, left);
  }

  if (_clientScene.hasOwnProperty(thingId)) {
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      if (_drag.wasOutside) {
        placePlayingCard(thingId, top, left);
      } else {
        placePlayingCard(thingId, top, left);
        turnPlayingCardAround(thingId);
      }
    }
    if (_clientScene[thingId].behavesAs === DICE) {
      if (_drag.wasOutside) {
        moveDice(thingId, top, left);
      } else {
        moveDice(thingId, top, left);
        rollDice(thingId);
      }
    }
    if (_clientScene[thingId].behavesAs === MARBLE) {
      moveMarble(thingId, top, left);
    }
  }

  _drag = null;

  window.requestAnimationFrame(render);
}

function onKeyUp(event) {
  const thingId = event.target.id;

  // TODO: textAreaControls(this, "backgroundColor")
  // Sets up an DOM element, wires handlers, handles lock-out and
  // and modifies property of scene that gets automatically synchronized
  // Or a handler iterates {canBeEdited: {id1: true}} and
  // {hasBackgroundColor: {id1: "blue"}} automatically. Probably more intuitive.

  if (thingId.endsWith("ModifyBackground")) {
    modifyBackground(
      thingId.slice(0, -"ModifyBackground".length),
      event.target.value
    );
  }
  if (thingId.endsWith("ModifyImage")) {
    modifyImage(thingId.slice(0, -"ModifyImage".length), event.target.value);
  }
  if (thingId.endsWith("ModifySides")) {
    modifySides(thingId.slice(0, -"ModifySides".length), event.target.value);
  }
  if (thingId.endsWith("ModifyFaceImage")) {
    modifyFaceImage(
      thingId.slice(0, -"ModifyFaceImage".length),
      event.target.value
    );
  }
  if (thingId.endsWith("ModifyBackImage")) {
    modifyBackImage(
      thingId.slice(0, -"ModifyBackImage".length),
      event.target.value
    );
  }

  if (_clientScene.hasOwnProperty(thingId)) {
    if (_clientScene[thingId].behavesAs === TEXT_AREA) {
      editTextArea(thingId, event.target.value);
    }
    if (_clientScene[thingId].behavesAs === PLAYER_AVATAR) {
      editPlayerAvatar(thingId, event.target.value);
    }
  }

  window.requestAnimationFrame(render);
}

/*
  ____                                      _           _   _
 / ___|___  _ __ ___  _ __ ___  _   _ _ __ (_) ___ __ _| |_(_) ___  _ __
| |   / _ \| '_ ` _ \| '_ ` _ \| | | | '_ \| |/ __/ _` | __| |/ _ \| '_ \
| |__| (_) | | | | | | | | | | | |_| | | | | | (_| (_| | |_| | (_) | | | |
 \____\___/|_| |_| |_|_| |_| |_|\__,_|_| |_|_|\___\__,_|\__|_|\___/|_| |_|

  Communication
 */

function requestJoinGame() {
  // Parameters not present in url will be undefined.
  let [path, parameters] = parseUrl(window.location.href);
  const msg = {
    request: "joinGame",
    boardId: parameters.board,
    gameId: parameters.game,
    playerId: parameters.player,
  };
  _websocket.send(JSON.stringify(msg));
}

function handleGameJoined(msg) {
  _boardId = msg.boardId;
  _gameId = msg.gameId;
  _playerId = msg.playerId;
  _gameTicks = 0;
  _serverScene = {};
  _clientScene = {};
  _diffToServer = {};
  const url = new URL(window.location);
  url.searchParams.set("board", _boardId);
  url.searchParams.set("game", _gameId);
  url.searchParams.set("player", _playerId);
  window.history.pushState({}, "", url);
}

function handleSceneModified(msg) {
  _gameTicks = msg.ticks;
  _serverScene = msg.scene;

  const resp = {
    request: "modifyScene",
    gameId: _gameId,
    playerId: _playerId,
    changes: _diffToServer,
  };
  _websocket.send(JSON.stringify(resp));

  window.requestAnimationFrame(render);
}

function parseUrl(url) {
  let path = null;
  let parameters = {};

  const pathQuery = url.split("?");

  if (pathQuery.length === 1) {
    path = pathQuery[0];
  } else {
    path = pathQuery[0];
    const parts = pathQuery[1].split("&");

    for (const p of parts) {
      const keyValue = p.split("=");
      if (keyValue.length === 1) {
        parameters[keyValue[0]] = true;
      } else {
        parameters[keyValue[0]] = keyValue[1];
      }
    }
  }

  return [path, parameters];
}

/*
 ___       _ _   _       _ _          _   _
|_ _|_ __ (_| |_(_) __ _| (_)______ _| |_(_) ___  _ __
 | || '_ \| | __| |/ _` | | |_  / _` | __| |/ _ \| '_ \
 | || | | | | |_| | (_| | | |/ | (_| | |_| | (_) | | | |
|___|_| |_|_|\__|_|\__,_|_|_/___\__,_|\__|_|\___/|_| |_|
*/

function keepWebsocketConnected() {
  _websocket = new WebSocket("ws://" + window.location.hostname + ":8080");

  _websocket.onopen = function () {
    requestJoinGame();
  };

  _websocket.onmessage = function (msg) {
    const obj = JSON.parse(msg.data);
    if (obj.announce === "gameJoined") {
      handleGameJoined(obj);
    }
    if (obj.announce === "sceneModified") {
      handleSceneModified(obj);
    }
  };

  _websocket.onerror = function () {
    window.setTimeout(keepWebsocketConnected, 2000);
  };

  _websocket.onclose = function () {
    window.setTimeout(keepWebsocketConnected, 2000);
  };
}

keepWebsocketConnected();

document.body.onmousemove = onMouseMove;
document.body.onmouseup = onMouseUp;

// Wire input handlers for elements already present in the HTML

const createEditablePlayingBoardElement = document.getElementById(
  "CreateEditablePlayingBoard"
);
if (createEditablePlayingBoard !== null) {
  createEditablePlayingBoardElement.onclick = onMouseClick;
}
const createEditableMarbleElement = document.getElementById(
  "CreateEditableMarble"
);
if (createEditableMarbleElement !== null) {
  createEditableMarbleElement.onclick = onMouseClick;
}
const createEditableDiceElement = document.getElementById("CreateEditableDice");
if (createEditableDiceElement !== null) {
  createEditableDiceElement.onclick = onMouseClick;
}
const createEditablePrivateAreaElement = document.getElementById(
  "CreateEditablePrivateArea"
);
if (createEditablePrivateAreaElement !== null) {
  createEditablePrivateAreaElement.onclick = onMouseClick;
}
const createEditablePlayerAvatarElement = document.getElementById(
  "CreateEditablePlayerAvatar"
);
if (createEditablePlayerAvatarElement !== null) {
  createEditablePlayerAvatarElement.onclick = onMouseClick;
}
const createEditableCardElement = document.getElementById("CreateEditableCard");
if (createEditableCardElement !== null) {
  createEditableCardElement.onclick = onMouseClick;
}
const createEditableTextAreaElement = document.getElementById(
  "CreateEditableTextArea"
);
if (createEditableTextAreaElement !== null) {
  createEditableTextAreaElement.onclick = onMouseClick;
}
