class Client {
  scene: Scene;
  websocket: WebSocket | null = null;

  constructor() {
    this.scene = new Scene();
  }

  connect() {
    let [path, parameters] = parseUrl(window.location.href);

    this.scene.boardId = parameters.board || null;
    this.scene.gameId = parameters.game || null;
    this.scene.playerId =
      parameters.player || window.localStorage.getItem("playerId");

    this.websocket = new WebSocket(
      "ws://" + window.location.hostname + ":8080"
    );

    let outer = this;

    this.websocket.onopen = function (ev: Event) {
      outer.send();
    };

    this.websocket.onmessage = function (msg: MessageEvent<string>) {
      outer.receive(msg.data);
    };

    this.websocket.onerror = function (ev: Event) {
      window.setTimeout(outer.connect, 2000);
    };

    this.websocket.onclose = function (ev: Event) {
      window.setTimeout(outer.connect, 2000);
    };
  }

  send() {
    this.websocket?.send(JSON.stringify(this.scene.differences()));
  }

  receive(msg: string) {
    this.scene.synchronizeWith(JSON.parse(msg));

    window.localStorage.setItem("playerId", this.scene.playerId);

    let [path, parameters] = parseUrl(window.location.href);

    if (
      parameters.hasOwnProperty("board") === false ||
      parameters.board !== _computed.boardId
    ) {
      history.pushState(
        {},
        "",
        "/client.html?board=" + _computed.boardId + "&game=" + _computed.gameId
      );
    }

    // The server drives the tick rate. We answer to each message of the server.
    this.send();

    window.requestAnimationFrame(this.render);
  }

  render() {
    this.scene.render();
  }
}
