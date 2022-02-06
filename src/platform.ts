interface PlatformProps {
  x: number;
  y: number;
}

export class Platform {
  x: number;
  y: number;
  height: number;
  width: number;

  constructor(props: PlatformProps) {
    this.x = props.x;
    this.y = props.y;
    this.width = 320;
    this.height = 32;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
