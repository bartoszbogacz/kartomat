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

  resetElem: HTMLElement;
  homeElem: HTMLAnchorElement;

  constructor() {
    this.scene = new Scene();

    const other = this;

    this.homeElem = document.createElement("a");
    this.homeElem.className = "Button";
    this.homeElem.style.position = "absolute";
    this.homeElem.style.left = "800px";
    this.homeElem.style.top = "30px";
    this.homeElem.style.userSelect = "none";
    this.homeElem.innerHTML = "Kartomat";
    this.homeElem.href = "/";
    document.body.appendChild(this.homeElem);

    this.resetElem = document.createElement("div");
    this.resetElem.className = "Button";
    this.resetElem.style.position = "absolute";
    this.resetElem.style.left = "800px";
    this.resetElem.style.top = "70px";
    this.resetElem.style.userSelect = "none";
    this.resetElem.innerHTML = "Reset Game";
    this.resetElem.onclick = function () {
      const httpRequest = new XMLHttpRequest();
      httpRequest.open("PUT", "/reset?game=" + other.scene.gameId, true);
      httpRequest.send();
    };
    document.body.appendChild(this.resetElem);
  }

  connect(this: Client) {
    let [_, parameters] = parseUrl(window.location.href);

    this.scene.boardId = parameters["board"] || null;
    this.scene.gameId = parameters["game"] || null;
    this.scene.playerId =
      parameters["player"] || window.localStorage.getItem("playerId");
    this.scene.playerName = window.localStorage.getItem("playerName") || "";

    this.websocket = new WebSocket(
      "ws://" + window.location.hostname + ":8080"
    );

    let outer = this;

    this.websocket.onopen = function (_: Event) {
      outer.send();
    };

    this.websocket.onmessage = function (msg: MessageEvent<string>) {
      outer.receive(msg.data);
    };

    this.websocket.onerror = function (_: Event) {
      window.setTimeout(outer.connect.bind(outer), 2000);
    };

    this.websocket.onclose = function (_: Event) {
      window.setTimeout(outer.connect.bind(outer), 2000);
    };
  }

  send(this: Client) {
    this.websocket?.send(JSON.stringify(this.scene.differences()));
  }

  receive(this: Client, msg: string) {
    this.scene.synchronize(JSON.parse(msg));
    this.scene.layout();

    // TODO: Extract playerId, gameId and boardId here instead of
    // relying on scene to extract these.

    window.localStorage.setItem("playerId", this.scene.playerId);
    window.localStorage.setItem("playerName", this.scene.playerName);

    let [_, parameters] = parseUrl(window.location.href);

    if (
      parameters.hasOwnProperty("board") === false ||
      parameters["board"] !== this.scene.boardId ||
      parameters.hasOwnProperty("game") === false ||
      parameters["game"] !== this.scene.gameId
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
  }
}

const client = new Client();
client.connect();
