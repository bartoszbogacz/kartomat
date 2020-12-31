"use strict";

// TODO: Automatic re-connection
// TODO: Fix touchmove on cards
// TODO: Moveable player Avatars
// TODO: Wizard board

// TODO: Reify decks into game objects, i.e. their controls
// TODO: - Instead of left for deck ordering introduce deckIndex

// TODO: Introduce entity component traits for things to avoid this
//      weird dispatch code.

// TODO: Datastructure with computed values
// TODO: - Player tags should have player names
// TODO: - Do not use computed values anymore for computations,
//        only rendering.
// TODO: - Move derived property computation out of render and
//        into object specific classes

/*
  Constants
*/

const MINIMUM_OVERLAP = 500;
const DECK_Z_DEPTH = 200;

const PLAYING_BOARD = "PlayingBoard";
const PLAYING_BOARD_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "top",
  "left",
  "zIndex",
];

const MARBLE = "Marble";
const MARBLE_SYNCHRONIZED_PROPERTIES = ["ownedBy", "top", "left", "zIndex"];

const DICE = "Dice";
const DICE_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "top",
  "left",
  "sideUp",
  "zIndex",
];

const TEXT_AREA = "TextArea";
const TEXT_AREA_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "top",
  "left",
  "zIndex",
  "text",
];

const PLAYER_TAG = "PlayerTag";
const THIS_PLAYER_AVATAR = "ThisPlayerAvatar";
const PLAYER_AVATAR = "PlayerAvatar";
// Do not synchronize represents, effectively preventing
// modification of other players names.
const PLAYER_AVATAR_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "top",
  "left",
  "zIndex",
  "text",
];

const PRIVATE_AREA = "PrivateArea";
const PRIVATE_AREA_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "top",
  "left",
  "height",
  "width",
  "zIndex",
];

const PLAYING_CARD = "PlayingCard";
const PLAYING_CARD_SYNCHRONIZED_PROPERTIES = [
  "ownedBy",
  "isFaceup",
  "onDeck",
  "isFolded",
  "stride",
  "top",
  "left",
  "zIndex",
];

const MOVE_DECK_CONTROL = "MoveDeckControl";
const SHUFFLE_DECK_CONTROL = "ShuffleDeckControl";
const FOLD_DECK_CONTROL = "FoldDeckControl";
const TURN_DECK_CONTROL = "TurnDeckControl";

/*
  Global State
*/

let _boardId = null;
let _gameId = null;
let _playerId = null;
let _gameTicks = 0;
let _serverScene = {};
let _clientScene = {};
let _diffToServer = {};

/*
 ____  _             _             ____                      _
|  _ \| | __ _ _   _(_)_ __   __ _| __ )  ___   __ _ _ __ __| |
| |_) | |/ _` | | | | | '_ \ / _` |  _ \ / _ \ / _` | '__/ _` |
|  __/| | (_| | |_| | | | | | (_| | |_) | (_) | (_| | | | (_| |
|_|   |_|\__,_|\__, |_|_| |_|\__, |____/ \___/ \__,_|_|  \__,_|
               |___/         |___/
*/

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

function renderPlayerAvatar(thingId) {
  const thing = _clientScene[thingId];
  let element = document.getElementById(thingId);
  if (element === null) {
    element = document.createElement("textarea");
    element.id = thingId;
    element.value = thing.text;

    if (_clientScene[thingId].represents === _playerId) {
      element.className = THIS_PLAYER_AVATAR;
      element.disabled = false;
      element.onkeyup = onKeyUp;
    } else {
      element.className = PLAYER_AVATAR;
      element.disabled = true;
    }

    document.body.appendChild(element);
  }

  element.style.top = thing.computedTop + "px";
  element.style.left = thing.computedLeft + "px";
  element.style.width = thing.computedWidth + "px";
  element.style.height = thing.computedHeight + "px";
  element.style.zIndex = thing.computedZIndex;
}

function editPlayerAvatar(thingId, text) {
  if (_clientScene[thingId].represents === _playerId) {
    _clientScene[thingId].text = text;
  }
}

/*
 _____         _      _
|_   ______  _| |_   / \   _ __ ___  __ _
  | |/ _ \ \/ | __| / _ \ | '__/ _ \/ _` |
  | |  __/>  <| |_ / ___ \| | |  __| (_| |
  |_|\___/_/\_\\__/_/   \_|_|  \___|\__,_|
*/

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
 ____                   _                     _          _   _
/ ___| _   _ _ __   ___| |__  _ __ ___  _ __ (_)______ _| |_(_) ___  _ __
\___ \| | | | '_ \ / __| '_ \| '__/ _ \| '_ \| |_  / _` | __| |/ _ \| '_ \
 ___) | |_| | | | | (__| | | | | | (_) | | | | |/ | (_| | |_| | (_) | | | |
|____/ \__, |_| |_|\___|_| |_|_|  \___/|_| |_|_/___\__,_|\__|_|\___/|_| |_|
       |___/
*/

function render() {
  // Rest difference to server
  _diffToServer = {};

  for (const thingId of Object.keys(_serverScene)) {
    // Create scene object if it does not exist yet
    if (_clientScene.hasOwnProperty(thingId) === false) {
      _clientScene[thingId] = {};
    }

    // Only synchronize a specific set of properties
    let synchronizedProperties = [];
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      synchronizedProperties = PLAYING_CARD_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === PRIVATE_AREA) {
      synchronizedProperties = PRIVATE_AREA_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === TEXT_AREA) {
      synchronizedProperties = TEXT_AREA_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === PLAYER_AVATAR) {
      synchronizedProperties = PLAYER_AVATAR_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === DICE) {
      synchronizedProperties = DICE_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === MARBLE) {
      synchronizedProperties = MARBLE_SYNCHRONIZED_PROPERTIES;
    }
    if (_clientScene[thingId].behavesAs === PLAYING_BOARD) {
      synchronizedProperties = PLAYING_BOARD_SYNCHRONIZED_PROPERTIES;
    }

    // Determine if clientScene changed w.r.t. serverScene and
    // whether such change is allowed at all.
    if (
      _serverScene[thingId].ownedBy === null ||
      _serverScene[thingId].ownedBy === _playerId ||
      _serverScene[thingId].upToTick + 5 < _gameTicks
    ) {
      for (const prop of synchronizedProperties) {
        if (_clientScene[thingId][prop] !== _serverScene[thingId][prop]) {
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
      for (const prop of synchronizedProperties) {
        _diffToServer[thingId][prop] = _clientScene[thingId][prop];
      }
    } else {
      for (const [prop, value] of Object.entries(_serverScene[thingId])) {
        _clientScene[thingId][prop] = value;
      }
    }
  }

  // Compute positions for all cards
  for (const [thingId, thing] of Object.entries(_clientScene)) {
    if (thing.behavesAs === PLAYING_CARD) {
      thing.computedTop = thing.top;
      thing.computedLeft = thing.left;
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
  event.preventDefault();

  const thingId = event.target.id;

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
  event.preventDefault();

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;

  const drag = {
    target: event.target,
    targetTop: event.target.offsetTop,
    targetLeft: event.target.offsetLeft,
    startY: clientY,
    startX: clientX,
    wasOutside: false,
  };

  const thingId = drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    takeCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length));
  } else {
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      takePlayingCard(thingId);
    }
  }

  document.onmousemove = function (event) {
    onMouseMove(drag, event);
  };
  document.onmouseup = function (event) {
    onMouseUp(drag, event);
  };

  window.requestAnimationFrame(render);
}

function onMouseMove(drag, event) {
  event.preventDefault();

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;
  const top = drag.targetTop - drag.startY + clientY;
  const left = drag.targetLeft - drag.startX + clientX;
  const isOutside =
    Math.abs(drag.startY - event.clientY) +
      Math.abs(drag.startX - event.clientX) >
    50;

  drag.wasOutside = drag.wasOutside || isOutside;

  const thingId = drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    moveCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length), top, left);
  } else {
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

function onMouseUp(drag, event) {
  event.preventDefault();

  const touch = event.type === "touchmove";
  const clientY = touch ? event.touches[0].clientY : event.clientY;
  const clientX = touch ? event.touches[0].clientX : event.clientX;
  const top = drag.targetTop - drag.startY + clientY;
  const left = drag.targetLeft - drag.startX + clientX;
  const isOutside =
    Math.abs(drag.startY - event.clientY) +
      Math.abs(drag.startX - event.clientX) >
    50;

  drag.wasOutside = drag.wasOutside || isOutside;

  const thingId = drag.target.id;

  if (thingId.endsWith(MOVE_DECK_CONTROL)) {
    placeCardDeck(thingId.slice(0, -MOVE_DECK_CONTROL.length), top, left);
  } else {
    if (_clientScene[thingId].behavesAs === PLAYING_CARD) {
      if (drag.wasOutside) {
        placePlayingCard(thingId, top, left);
      } else {
        placePlayingCard(thingId, top, left);
        turnPlayingCardAround(thingId);
      }
    }
    if (_clientScene[thingId].behavesAs === DICE) {
      if (drag.wasOutside) {
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

  document.onmousemove = null;
  document.onmouseup = null;
  window.requestAnimationFrame(render);
}

function onKeyUp(event) {
  const thingId = event.target.id;
  if (_clientScene[thingId].behavesAs === TEXT_AREA) {
    editTextArea(thingId, event.target.value);
  }
  if (_clientScene[thingId].behavesAs === PLAYER_AVATAR) {
    editPlayerAvatar(thingId, event.target.value);
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

let _websocket = null;
keepWebsocketConnected();
