import { createImage } from "./utils";

import coin from "./images/coin.png";

interface CoinProps {
  x: number;
  y: number;
}

const coinSprite = createImage(coin);

export class Coin {
  x: number;
  y: number;
  width: 32;
  height: 32;
  dy: number;
  initialY: number;
  bounceOffset: number;

  constructor(props: CoinProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 32;
    this.dy = -20;
    this.initialY = this.y;
    this.bounceOffset = this.initialY - 50;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(coinSprite, this.x, this.y, this.width, this.height);
  }

  update(): void {
    this.y += this.dy;
  }
}
