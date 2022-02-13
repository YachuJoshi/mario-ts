import { createImage } from "./utils";
import powerUpImage from "./images/powerups.png";

type PowerUpType = "mushroom" | "flower";

interface PowerUpProps {
  x: number;
  y: number;
  type: PowerUpType;
}

const powerUpSprite = createImage(powerUpImage);

export class PowerUp {
  x: number;
  y: number;
  dx: number;
  dy: number;
  sX: number;
  sY: number;
  speed: 2;
  height: 32;
  width: 32;
  frames: number;
  type: PowerUpType;

  constructor(props: PowerUpProps) {
    this.x = props.x;
    this.y = props.y;
    this.sX = 0;
    this.sY = 0;
    this.speed = 2;
    this.dx = this.speed;
    this.dy = 0;
    this.height = 32;
    this.width = 32;
    this.type = props.type;
    this.frames = this.type === "mushroom" ? 0 : 1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.sX = this.frames * this.width;
    ctx.drawImage(
      powerUpSprite,
      this.sX,
      this.sY,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  update(): void {
    if (this.type === "flower") return;

    this.x += this.dx;
    this.y += this.dy;
  }
}
