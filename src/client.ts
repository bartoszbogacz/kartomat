function parseUrl(url: string): [string, { [key: string]: any }] {
  let path = null;
  let parameters: { [key: string]: any } = {};

  const pathQuery = url.split("?") as [string] | [string, string];

  if (pathQuery.length === 1) {
    path = pathQuery[0];
  } else {
    path = pathQuery[0];
    const parts = pathQuery[1].split("&");

    for (const p of parts) {
      const keyValue = p.split("=") as [string] | [string, string];
      if (keyValue.length === 1) {
        parameters[keyValue[0]] = true;
      } else {
        parameters[keyValue[0]] = keyValue[1];
      }
    }
  }

  return [path, parameters];
}

class Client {
  scene: Scene;
  websocket: WebSocket | null = null;

  constructor() {
    this.scene = new Scene();
  }

  connect(this: Client) {
    let [path, parameters] = parseUrl(window.location.href);

    this.scene.boardId = parameters["board"] || null;
    this.scene.gameId = parameters["game"] || null;
    this.scene.playerId =
      parameters["player"] || window.localStorage.getItem("playerId");

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
      window.setTimeout(outer.connect.bind(outer), 2000);
    };

    this.websocket.onclose = function (ev: Event) {
      window.setTimeout(outer.connect.bind(outer), 2000);
    };
  }

  send(this: Client) {
    this.websocket?.send(JSON.stringify(this.scene.differences()));
  }

  receive(this: Client, msg: string) {
    this.scene.synchronize(JSON.parse(msg));

    window.localStorage.setItem("playerId", this.scene.playerId);

    let [path, parameters] = parseUrl(window.location.href);

    if (
      parameters.hasOwnProperty("board") === false ||
      parameters["board"] !== this.scene.boardId
    ) {
      history.pushState(
        {},
        "",
        "/client.html?board=" +
          this.scene.boardId +
          "&game=" +
          this.scene.gameId
      );
    }

    // The server drives the tick rate. We answer to each message of the server.
    this.send();

    this.scene.render();
  }
}

const client = new Client();
client.connect();
