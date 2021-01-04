"use strict";
function layeredSynchronize(local, remote) {
    local.layered = unionLastWriterWins(local.layered, remote.layered);
}
function layeredCompute(local) {
    //
}
