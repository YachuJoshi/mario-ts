import { createImage } from "./utils";
import bulletImage from "./images/bullet.png";

interface BulletProps {
  x: number;
  y: number;
}

const bulletSprite = createImage(bulletImage);

export class Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  height: 16;
  width: 16;
  speed: 4;

  constructor(props: BulletProps) {
    this.x = props.x;
    this.y = props.y;
    this.height = 16;
    this.width = 16;
    this.speed = 4;
    this.dx = this.speed;
    this.dy = this.speed;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(bulletSprite, this.x, this.y, this.width, this.height);
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }
}
