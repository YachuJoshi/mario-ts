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
  isMoving: boolean;
  isOnGround: boolean;
  direction: Direction;

  constructor(props: MarioProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 44;
    this.dx = 0;
    this.dy = 0;
    this.speed = 4;
    this.isMoving = this.dx !== 0;
    this.direction = !this.isMoving ? "idle" : this.dx > 0 ? "right" : "left";
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;

    if (this.y + this.height + this.dy < CANVAS_HEIGHT) {
      this.dy += gravity;
      this.isOnGround = false;
    }
  }
}
