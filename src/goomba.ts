import { createImage } from "./utils";
import goombaImg from "./images/goomba.png";

interface GoombaProps {
  x: number;
  y: number;
}

type GoombaState = "alive" | "dead";

const goombaImage = createImage(goombaImg);

export class Goomba {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  sX: number;
  sY: number;
  speed: 1;
  type: 12;
  state: GoombaState;
  frames: number;
  tick: number;
  maxTick: number;

  constructor(props: GoombaProps) {
    this.x = props.x;
    this.y = props.y;
    this.sX = 0;
    this.sY = 0;
    this.width = 32;
    this.height = 32;
    this.speed = 1;
    this.dx = this.speed;
    this.type = 12;
    this.state = "alive";
    this.frames = 0;
    this.maxTick = 10;
    this.tick = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.sX = this.frames * this.width;
    ctx.drawImage(
      goombaImage,
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
    this.x += this.dx;
    this.tick++;

    if (this.tick > this.maxTick) {
      this.tick = 0;

      if (this.frames === 0) {
        this.frames = 1;
      } else {
        this.frames = 0;
      }
    }
  }
}
