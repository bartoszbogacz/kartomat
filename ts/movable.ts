interface Moveable extends Synchronized {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
}

function moveablesRender(moveables: { [key: string]: Moveable }) {
  for (const [movableId, moveable] of Object.entries(moveables)) {
    let elem = document.getElementById(movableId);
    if (elem === null) {
      elem = document.createElement("div");
      elem.id = movableId + "OwnerTag";
      elem.className = "OwnerTag";
      document.body.appendChild(elem);
    }

    elem.style.top = moveable.y + moveable.h + "px";
    elem.style.left = moveable.x + moveable.w + "px";
    elem.style.zIndex = (moveable.z + 1).toString();
    if (moveable.ownedBy === null) {
      elem.style.visibility = "hidden";
    } else {
      elem.style.visibility = "visible";
      elem.innerHTML = moveable.ownedBy;
    }
  }
}

function moveablesTake(moveableId: string, m: { [key: string]: Moveable }) {
  m[moveableId].z = moveablesFindTop(m);
}

function moveablesMove(
  moveableId: string,
  m: { [key: string]: Moveable },
  x: number,
  y: number
) {
  m[moveableId].x = x;
  m[moveableId].y = y;
}

function moveablesOverlaps(movable: {
  [key: string]: Moveable;
}): { [a: string]: { [b: string]: number } } {
  const overlaps: { [a: string]: { [b: string]: number } } = {};
  for (const [cardId, card] of Object.entries(movable)) {
    overlaps[cardId] = {};
    for (const [otherId, other] of Object.entries(movable)) {
      if (otherId === cardId) {
        continue;
      }
      const h =
        Math.min(card.x + card.w, other.x + other.w) -
        Math.max(card.x, other.x);
      const v =
        Math.min(card.y + card.w, other.y + other.h) -
        Math.max(card.y, other.y);

      overlaps[cardId][otherId] = Math.max(0, h) * Math.max(0, v);
    }
  }
  return overlaps;
}

function moveablesFindTop(movables: { [key: string]: Moveable }) {
  let result = 0;
  for (const [cardId, card] of Object.entries(movables)) {
    if (card.z > result) {
      result = card.z;
    }
  }
  return result;
}
