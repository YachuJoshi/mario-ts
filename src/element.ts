import { createImage } from "./utils";

import elements from "./images/elements.png";

interface ElementProps {
  x: number;
  y: number;
  type: number;
}

const elementImage = createImage(elements);

export class Element {
  x: number;
  y: number;
  sX: number;
  sY: number;
  type: number;
  height: number;
  width: number;

  constructor(props: ElementProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 32;
    this.height = 32;
    this.type = props.type;
    this.sX = (this.type - 1) * this.width;
    this.sY = 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      elementImage,
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
}
