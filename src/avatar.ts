interface AvatarItem extends Synchronized {
  represents: string | null;
  text: string;
}

function avatarsCompute(local: GameState, computed: ComputedState) {
  const playerAvatars: { [key: string]: string } = {};

  for (const [itemId, avatar] of Object.entries(local.avatars)) {
    if (avatar.represents !== null) {
      playerAvatars[avatar.represents] = itemId;
    }
  }

  if (
    computed.playerId !== null &&
    playerAvatars.hasOwnProperty(computed.playerId) === false
  ) {
    for (const [itemId, avatar] of Object.entries(local.avatars)) {
      if (avatar.represents === null) {
        avatar.tick = computed.tick;
        avatar.ownedBy = computed.playerId;
        avatar.represents = computed.playerId;
        break;
      }
    }
  }

  computed.playerAvatars = playerAvatars;
}

function avatarsRender(local: GameState, computed: ComputedState) {
  for (const key of Object.keys(local.avatars)) {
    const avt = local.avatars[key];
    const loc = local.locatables[key];

    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("textarea");
      elem.onkeyup = onKeyUp;
      elem.id = key;
      elem.className = "Writeable";
      (elem as any).value = avt.text;
      elem.style.position = "absolute";
      elem.style.resize = "none";
      elem.style.outline = "none";
      elem.style.fontFamily = "monospace";
      elem.style.fontSize = "16px";
      document.body.appendChild(elem);
    }

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.zIndex = loc.z.toString();
    if (local.avatars[key].represents === computed.playerId) {
      (elem as any).disabled = false;
    } else {
      (elem as any).disabled = true;
      (elem as any).value = avt.text;
    }

    if (local.avatars[key].represents === computed.playerId) {
      elem.style.backgroundColor = "#fdfdee";
      elem.style.border = "2px solid #93a1a1";
      elem.style.color = "#586e75";
    } else if (local.avatars[key].represents !== null) {
      elem.style.backgroundColor = "#eeeae2";
      elem.style.border = "2px solid #93a1a1";
      elem.style.color = "#586e75";
    } else {
      elem.style.backgroundColor = "snow";
      elem.style.border = "gray";
      elem.style.color = "lightgray";
    }
  }
}

function avatarsKeyUp(
  local: GameState,
  computed: ComputedState,
  itemId: string
) {
  if (local.avatars.hasOwnProperty(itemId)) {
    let elem = document.getElementById(itemId);
    if (elem !== null) {
      local.avatars[itemId].tick = computed.tick;
      local.avatars[itemId].ownedBy = computed.playerId;
      local.avatars[itemId].text = (elem as any).value;
    }
  }
}
