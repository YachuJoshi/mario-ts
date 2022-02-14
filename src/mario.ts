import { createImage } from "./utils";
import marioImg from "./images/mario.png";

interface MarioProps {
  x: number;
  y: number;
}

type MarioCategory = "small" | "big" | "super";
const marioSprite = createImage(marioImg);

export class Mario {
  x: number;
  y: number;
  sX: number;
  sY: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  speed: 4;
  isJumping: boolean;
  isOnGround: boolean;
  isInvulnerable: boolean;
  frames: number;
  tick: number;
  maxTick: number;
  category: MarioCategory;

  constructor(props: MarioProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 44;
    this.sX = 0;
    this.sY = 4;
    this.dx = 0;
    this.dy = 0;
    this.speed = 4;
    this.isInvulnerable = false;
    this.category = "small";
    this.isJumping = false;
    this.isOnGround = false;
    this.frames = 0;
    this.tick = 0;
    this.maxTick = 25;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    let roundedY = this.y | 0;
    this.sX = this.frames * this.width;
    ctx.drawImage(
      marioSprite,
      this.sX,
      this.sY,
      this.width,
      this.height,
      this.x,
      roundedY,
      this.width,
      this.height
    );
  }

  updateSprite(): void {
    if (this.category === "small") {
      this.height = 44;

      if (this.isInvulnerable) {
        this.sY = 222;
        return;
      }

      this.sY = 4;
      return;
    }

    // Big & Super height
    this.height = 60;

    if (this.category === "big") {
      if (this.isInvulnerable) {
        this.sY = 276;
        return;
      }

      this.sY = 90;
      return;
    }

    // Super source Y
    this.sY = 152;
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;
  }
}
