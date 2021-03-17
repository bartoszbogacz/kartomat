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

    // There is only one place where we use .preventDefault() on
    // mouse up/down/move and it is not strictly necessary. If we
    // can do without we may use passive event listeners that do
    // not block the browser and may be executed concurrently with
    // DOM rendering.

    // https://developers.google.com/web/updates/2016/06/
    // passive-event-listeners
    source.addEventListener("mousedown", this.mouseDown.bind(this), {
      passive: false,
      capture: true,
    });
    source.addEventListener("touchstart", this.mouseDown.bind(this), {
      passive: false,
      capture: true,
    });
  }

  mouseDown(event: Event) {
    const touch = event.type === "touchstart";
    const clientY = touch
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;
    const clientX = touch
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;

    this.state = {
      element: event.target as HTMLElement,
      startX: clientX,
      startY: clientY,
      x: (event.target as HTMLElement).offsetLeft,
      y: (event.target as HTMLElement).offsetTop,
      wasOutside: false,
    };

    this.target.take();

    document.onmousemove = this.mouseMove.bind(this);
    document.onmouseup = this.mouseUp.bind(this);
  }

  mouseMove(event: Event) {
    // Using preventDefault here precludes textareas working on
    // mobile. Since we only want to prevent selection and dragging
    // of elements, preventDefault on mouseMove is enough.
    event.preventDefault();

    if (this.state === null) {
      return;
    }

    const touch = event.type === "touchmove";
    const clientY = touch
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;
    const clientX = touch
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;

    const y = this.state.y - this.state.startY + clientY;
    const x = this.state.x - this.state.startX + clientX;
    const isOutside =
      Math.abs(this.state.startY - clientY) +
        Math.abs(this.state.startX - clientX) >
      50;

    this.state.wasOutside = this.state.wasOutside || isOutside;

    this.target.move(x, y);
  }

  mouseUp(event: Event) {
    if (this.state === null) {
      return;
    }
    this.target.place(this.state.wasOutside);

    this.state = null;
    document.onmousemove = null;
    document.onmouseup = null;
  }
}
