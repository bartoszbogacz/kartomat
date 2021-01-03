"use strict";
/** Union two LWWMaps returning a copy of the superset.
 *
 * The union is biased towards state2 on equal tick counts of both,
 * by performing the merging of state2 onto result secondary and
 * avoid an explicit lesser equals check there.
 *
 */
function unionLastWriterWins(state1, state2) {
    const result = {};
    for (const key of Object.keys(state2)) {
        if (state1.hasOwnProperty(key) && state1[key].tick > state2[key].tick) {
            continue;
        }
        for (const [prop, value] of Object.entries(state2[key])) {
            result[key][prop] = value;
        }
    }
    for (const key of Object.keys(state1)) {
        if (state2.hasOwnProperty(key) && state2[key].tick > state1[key].tick) {
            continue;
        }
        for (const [prop, value] of Object.entries(state1[key])) {
            result[key][prop] = value;
        }
    }
    return result;
}
/** Derives computed properties for all decks
 *
 * Collates cards into deck.contains by their stacked.onItem and
 * orders those by their stacked.atIndex
 */
function decksCompute(state) {
    const decks = {};
    for (const [key, loc] of Object.entries(state.located)) {
        decks[key] = {
            x: loc.x,
            y: loc.y,
            z: loc.z,
            w: loc.w,
            h: loc.h,
            stride: 1,
            contains: [],
        };
    }
    for (const [key, st] of Object.entries(state.stacking)) {
        decks[key].stride = st.strides[st.current];
    }
    for (const [key, st] of Object.entries(state.stacked)) {
        if (st.onItem !== null) {
            decks[st.onItem].contains.push(key);
        }
    }
    for (const [_, deck] of Object.entries(decks)) {
        deck.contains.sort((a, b) => state.stacked[a].atIndex - state.stacked[b].atIndex);
    }
    return decks;
}
function decksRender(decks) {
    for (const [deckId, deck] of Object.entries(decks)) {
        let moveControl = document.getElementById(deckId + "MoveControl");
        if (moveControl === null) {
            moveControl = document.createElement("div");
            moveControl.id = deckId + "MoveControl";
            moveControl.className = "MoveControl";
            // moveControl.onmousedown = onMouseDown;
            document.body.appendChild(moveControl);
        }
        let shuffleControl = document.getElementById(deckId + "ShuffleControl");
        if (shuffleControl === null) {
            shuffleControl = document.createElement("div");
            shuffleControl.id = deckId + "ShuffleControl";
            shuffleControl.className = "ShuffleControl";
            //shuffleControl.onclick = onMouseClick;
            document.body.appendChild(shuffleControl);
        }
        let foldControl = document.getElementById(deckId + "FoldControl");
        if (foldControl === null) {
            foldControl = document.createElement("div");
            foldControl.id = deckId + "FoldControl";
            foldControl.className = "FoldControl";
            //foldControl.onclick = onMouseClick;
            document.body.appendChild(foldControl);
        }
        let turnControl = document.getElementById(deckId + "TurnControl");
        if (turnControl === null) {
            turnControl = document.createElement("div");
            turnControl.id = deckId + "TurnControl";
            turnControl.className = "TurnControl";
            //turnControl.onclick = onMouseClick;
            document.body.appendChild(turnControl);
        }
        if (deck.contains.length > 0) {
            moveControl.style.left = deck.x - 30 + "px";
            moveControl.style.top = deck.y + "px";
            moveControl.style.zIndex = deck.z + "px";
            moveControl.style.visibility = "visible";
        }
        else {
            moveControl.style.visibility = "hidden";
        }
        if (deck.contains.length > 0) {
            shuffleControl.style.left = deck.x - 30 + "px";
            shuffleControl.style.top = deck.y - 30 + "px";
            shuffleControl.style.zIndex = deck.z + "px";
            shuffleControl.style.visibility = "visible";
        }
        else {
            shuffleControl.style.visibility = "hidden";
        }
        if (deck.contains.length > 0) {
            foldControl.style.left = deck.x - 30 + "px";
            foldControl.style.top = deck.y - 60 + "px";
            foldControl.style.zIndex = deck.z + "px";
            foldControl.style.visibility = "visible";
        }
        else {
            foldControl.style.visibility = "hidden";
        }
        if (deck.contains.length > 0) {
            turnControl.style.left = deck.x - 30 + "px";
            turnControl.style.top = deck.y - 90 + "px";
            turnControl.style.zIndex = deck.z + "px";
            turnControl.style.visibility = "visible";
        }
        else {
            turnControl.style.visibility = "hidden";
        }
    }
}
function deckJoinDeck(state, computed, deckId, otherId) {
    for (let i = 0; i < computed.decks[deckId].contains.length; i++) {
        const cardId = computed.decks[deckId].contains[i];
        state.stacked[cardId].onItem = otherId;
        state.stacked[cardId].atIndex = i;
    }
}
/** Derives computed properties for all cards
 *
 * Computes cards either given their own locations or
 * in relation to decks they are placed on.
 */
function cardsCompute(state, decks) {
    const cards = {};
    for (const [key, loc] of Object.entries(state.located)) {
        cards[key] = {
            ownedBy: null,
            x: loc.x,
            y: loc.y,
            z: loc.z,
            w: loc.w,
            h: loc.h,
            isFaceup: false,
            faceImage: "rummy/club_1.png",
            backImage: "rummy/back_red.png",
        };
    }
    for (const [_, deck] of Object.entries(decks)) {
        for (let i = 0; i < deck.contains.length; i++) {
            const cardId = deck.contains[i];
            cards[cardId] = {
                ownedBy: null,
                x: deck.x + (i + 1) * deck.stride,
                y: deck.y,
                z: deck.z + (i + 1),
                w: state.located[cardId].w,
                h: state.located[cardId].h,
                isFaceup: false,
                faceImage: "rummy/club_1.png",
                backImage: "rummy/back_red.png",
            };
        }
    }
    return cards;
}
function cardsRender(cards) {
    for (const [cardId, card] of Object.entries(cards)) {
        let cardEl = document.getElementById(cardId);
        if (cardEl === null) {
            cardEl = document.createElement("div");
            cardEl.id = cardId;
            cardEl.className = "PlayingCard";
            //element.onmousedown = onMouseDown;
            document.body.appendChild(cardEl);
        }
        let tagEl = document.getElementById(cardId);
        if (tagEl === null) {
            tagEl = document.createElement("div");
            tagEl.id = cardId + "PlayerTag";
            tagEl.className = "PlayerTag";
            document.body.appendChild(tagEl);
        }
        cardEl.style.top = card.y + "px";
        cardEl.style.left = card.x + "px";
        cardEl.style.width = card.w + "px";
        cardEl.style.height = card.h + "px";
        cardEl.style.zIndex = card.z.toString();
        if (card.isFaceup) {
            cardEl.style.backgroundImage = "url(" + card.faceImage + ")";
        }
        else {
            cardEl.style.backgroundImage = "url(" + card.backImage + ")";
        }
        tagEl.style.top = card.y + card.h + "px";
        tagEl.style.left = card.x + card.w + "px";
        tagEl.style.zIndex = (card.z + 1).toString();
        if (card.ownedBy === null) {
            tagEl.style.visibility = "hidden";
        }
        else {
            tagEl.style.visibility = "visible";
            tagEl.innerHTML = card.ownedBy;
        }
    }
}
function cardTake(state, computed, cardId) {
    state.stacked[cardId].onItem = null;
    state.located[cardId].z = cardFindTop(computed);
}
function cardMove(state, cardId, x, y) {
    state.located[cardId].x = x;
    state.located[cardId].y = y;
}
function cardPlace(state, cardId, x, y) {
    state.located[cardId].x = x;
    state.located[cardId].y = y;
    //
}
function cardJoinDeck(state, computed, cardId, deckId) {
    state.stacked[cardId].onItem = deckId;
    state.stacked[cardId].atIndex = 0;
}
function cardLeaveDeck(state, cardId) {
    state.stacked[cardId].onItem = null;
}
function cardFindTop(computed) {
    let result = 0;
    for (const [cardId, card] of Object.entries(computed)) {
        if (card.z > result) {
            result = card.z;
        }
    }
    return result;
}
function cardFindDeck(computed, cardId) {
    const overlaps = cardFindOverlaps(computed, cardId);
    let largest = null;
    for (const [otherId, pixels] of Object.entries(overlaps)) {
        if ()
            ;
    }
    return null;
}
function cardFindOverlaps(computed, cardId) {
    const overlaps = {};
    const card = computed.cards[cardId];
    for (const [otherId, other] of Object.entries(computed.cards)) {
        if (otherId === cardId) {
            continue;
        }
        const h = Math.min(card.x + card.w, other.x + other.w) - Math.max(card.x, other.x);
        const v = Math.min(card.y + card.w, other.y + other.h) - Math.max(card.y, other.y);
        overlaps[otherId] = Math.max(0, h) * Math.max(0, v);
    }
    return overlaps;
}
