import { createImage } from "./utils";
import bulletImage from "./images/bullet.png";

type Direction = "left" | "right";
interface BulletProps {
  x: number;
  y: number;
  direction: Direction;
}

const bulletSprite = createImage(bulletImage);

export class Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  height: 16;
  width: 16;
  speed: 3;
  initialY: number;
  bounceOffset: number;

  constructor(props: BulletProps) {
    this.x = props.x;
    this.y = props.y;
    this.height = 16;
    this.width = 16;
    this.speed = 3;
    this.dx = props.direction === "left" ? -this.speed : this.speed;
    this.dy = this.speed;
    this.initialY = this.y;
    this.bounceOffset = this.initialY - 20;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(bulletSprite, this.x, this.y, this.width, this.height);
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }
}
