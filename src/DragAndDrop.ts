interface Moveable {
  take: () => void;
  move: (x: number, y: number) => void;
  place: (wasOutside: boolean) => void;
}

interface DragState {
  element: HTMLElement;
  x: number;
  y: number;
  startX: number;
  startY: number;
  wasOutside: boolean;
}

class DragAndDrop {
  private target: Moveable;
  private state: DragState | null = null;

  constructor(source: HTMLElement, target: Moveable) {
    this.target = target;

    // https://developers.google.com/web/updates/2016/06/
    // passive-event-listeners
    source.addEventListener("mousedown", this.mouseDown.bind(this), {
      passive: true,
      capture: true,
    });
    source.addEventListener("touchstart", this.mouseDown.bind(this), {
      passive: true,
      capture: true,
    });
  }

  mouseDown(event: Event) {
    let clientX: number = 0;
    let clientY: number = 0;

    if (event.type === "touchstart") {
      const touches = (event as TouchEvent).touches[0];
      if (touches) {
        clientX = touches.clientX;
        clientY = touches.clientY;
      }
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    this.state = {
      element: event.target as HTMLElement,
      startX: clientX,
      startY: clientY,
      x: (event.target as HTMLElement).offsetLeft,
      y: (event.target as HTMLElement).offsetTop,
      wasOutside: false,
    };

    this.target.take();

    document.addEventListener("mousemove", this.mouseMove.bind(this), {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchmove", this.mouseMove.bind(this), {
      passive: true,
      capture: true,
    });
    document.addEventListener("mouseup", this.mouseUp.bind(this), {
      passive: true,
      capture: true,
    });
    document.addEventListener("touchend", this.mouseUp.bind(this), {
      passive: true,
      capture: true,
    });
  }

  mouseMove(event: Event) {
    if (this.state === null) {
      return;
    }

    let clientX: number = 0;
    let clientY: number = 0;

    if (event.type === "touchmove") {
      const touches = (event as TouchEvent).touches[0];
      if (touches) {
        clientX = touches.clientX;
        clientY = touches.clientY;
      }
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    const y = this.state.y - this.state.startY + clientY;
    const x = this.state.x - this.state.startX + clientX;
    const isOutside =
      Math.abs(this.state.startY - clientY) +
        Math.abs(this.state.startX - clientX) >
      50;

    this.state.wasOutside = this.state.wasOutside || isOutside;

    this.target.move(x, y);
  }

  mouseUp(_: Event) {
    if (this.state === null) {
      return;
    }
    this.target.place(this.state.wasOutside);

    this.state = null;
    document.ontouchmove = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}
