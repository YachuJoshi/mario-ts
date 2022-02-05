import { CANVAS_HEIGHT } from "./base";

interface MarioProps {
  x: number;
  y: number;
}

type Direction = "left" | "right" | "idle";

const gravity = 1.2;

export class Mario {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  speed: number;
  direction: Direction;

  constructor(props: MarioProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 44;
    this.dx = 0;
    this.dy = 0;
    this.speed = 4;
    this.direction = "idle";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  setVelocity() {
    if (this.direction === "right") {
      this.dx = this.speed;
      return;
    }

    if (this.direction === "left") {
      this.dx = -this.speed;
      return;
    }

    this.dx = 0;
  }

  update(): void {
    this.setVelocity();

    this.x += this.dx;
    this.y += this.dy;

    if (this.y + this.height + this.dy >= CANVAS_HEIGHT) {
      this.dy = 0;
    } else {
      this.dy += gravity;
    }
  }
}
