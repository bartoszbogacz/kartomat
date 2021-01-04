interface Layered extends Synchronized {
  layer: number | null;
}

function layeredSynchronize(local: LocalGame, remote: RemoteGame) {
  local.layered = unionLastWriterWins(local.layered, remote.layered);
}

function layeredCompute(local: LocalGame) {
  //
}
