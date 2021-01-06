interface StratifierItem extends Synchronized {
  //
}

function stratifiersCompute(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed.");
  }

  const groups: { [key: string]: string[] } = {};

  for (const [key, st] of Object.entries(local.stratified)) {
    if (st.inLayer !== null) {
      if (groups.hasOwnProperty(st.inLayer)) {
        groups[st.inLayer].push(key);
      } else {
        groups[st.inLayer] = [key];
      }
    }
  }

  const stratifierIds = Object.keys(local.stratifiers);
  stratifierIds.sort(
    (a, b) =>
      (computed.locations as any)[a].z - (computed.locations as any)[b].z
  );

  let accumZ = 0;

  for (const stratifierId of stratifierIds) {
    const stratifier = local.stratifiers[stratifierId];
    const stratified = groups[stratifierId];

    stratified.sort(
      (a, b) =>
        (computed.locations as any)[a].z - (computed.locations as any)[b].z
    );

    // FIXME: To make room for stackings we add 100 to each item
    // instead of 1.

    for (const itemId of stratified) {
      if (computed.locations[itemId].ownedBy !== computed.playerId) {
        computed.locations[itemId].z = accumZ;
        accumZ = accumZ + 100;
      }
    }

    computed.locations[stratifierId].z = accumZ;
    accumZ = accumZ + 100;

    for (const itemId of stratified) {
      if (computed.locations[itemId].ownedBy === computed.playerId) {
        computed.locations[itemId].z = accumZ;
        accumZ = accumZ + 100;
      }
    }
  }
}

function stratifierRender(local: GameState, computed: ComputedState) {
  if (computed.locations === null) {
    throw new Error("Locations not yet computed");
  }

  for (const key of Object.keys(local.stratifiers)) {
    if (computed.locations.hasOwnProperty(key) === false) {
      // Stratifier is non-visual
      continue;
    }

    let elem = document.getElementById(key);
    if (elem === null) {
      elem = document.createElement("div");
      elem.onmousedown = onMouseDown;
      elem.id = key;
      elem.className = "Stratifier";
      elem.style.position = "absolute";
      elem.style.userSelect = "none";
      elem.style.background =
        "repeating-linear-gradient(" +
        "-45deg, #eeeae2, #eeeae2 1px, #fdfdee 1px, #fdfdee 10px)";
      elem.style.border = "3px dashed #d33682";
      document.body.appendChild(elem);
    }

    const loc = computed.locations[key];

    elem.style.top = loc.y + "px";
    elem.style.left = loc.x + "px";
    elem.style.width = loc.w + "px";
    elem.style.height = loc.h + "px";
    elem.style.zIndex = loc.z.toString();
  }
}
