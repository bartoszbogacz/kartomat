interface Stacking extends Synchronized {
  strides: [number];
  current: number;
}

function stackingsRender(
  stacks: { [key: string]: [string] },
  movables: { [key: string]: Moveable }
) {
  for (const key of Object.keys(stacks)) {
    let move = document.getElementById(key + "MoveControl");
    if (move === null) {
      move = document.createElement("div");
      move.id = key + "MoveControl";
      move.className = "MoveControl";
      // moveControl.onmousedown = onMouseDown;
      document.body.appendChild(move);
    }

    let shuffle = document.getElementById(key + "ShuffleControl");
    if (shuffle === null) {
      shuffle = document.createElement("div");
      shuffle.id = key + "ShuffleControl";
      shuffle.className = "ShuffleControl";
      //shuffleControl.onclick = onMouseClick;
      document.body.appendChild(shuffle);
    }

    let fold = document.getElementById(key + "FoldControl");
    if (fold === null) {
      fold = document.createElement("div");
      fold.id = key + "FoldControl";
      fold.className = "FoldControl";
      //foldControl.onclick = onMouseClick;
      document.body.appendChild(fold);
    }

    let turn = document.getElementById(key + "TurnControl");
    if (turn === null) {
      turn = document.createElement("div");
      turn.id = key + "TurnControl";
      turn.className = "TurnControl";
      //turnControl.onclick = onMouseClick;
      document.body.appendChild(turn);
    }

    const s = stacks[key];
    const m = movables[key];

    if (s.length > 0) {
      move.style.left = m.x - 30 + "px";
      move.style.top = m.y + "px";
      move.style.zIndex = m.z + "px";
      move.style.visibility = "visible";
    } else {
      move.style.visibility = "hidden";
    }

    if (s.length > 0) {
      shuffle.style.left = m.x - 30 + "px";
      shuffle.style.top = m.y - 30 + "px";
      shuffle.style.zIndex = m.z + "px";
      shuffle.style.visibility = "visible";
    } else {
      shuffle.style.visibility = "hidden";
    }

    if (s.length > 0) {
      fold.style.left = m.x - 30 + "px";
      fold.style.top = m.y - 60 + "px";
      fold.style.zIndex = m.z + "px";
      fold.style.visibility = "visible";
    } else {
      fold.style.visibility = "hidden";
    }

    if (s.length > 0) {
      turn.style.left = m.x - 30 + "px";
      turn.style.top = m.y - 90 + "px";
      turn.style.zIndex = m.z + "px";
      turn.style.visibility = "visible";
    } else {
      turn.style.visibility = "hidden";
    }
  }
}
