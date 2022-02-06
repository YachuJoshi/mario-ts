import { CANVAS_WIDTH as viewPort, MAP } from "./base";
import { tileSize } from "./constants";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Element } from "./element";

interface Keys {
  [key: string]: boolean;
}

const maxMapWidth = MAP[0].length * 32;

export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  scrollOffset: number;
  centerPos: number;
  keys: Keys;
  platforms: Element[];

  constructor() {
    this.init();
  }

  init(): void {
    const { canvas, ctx } = initCanvas();
    this.canvas = canvas;
    this.ctx = ctx;
    this.keys = {};
    this.mario = new Mario({
      x: 50,
      y: 100,
    });
    this.platforms = [];
    this.scrollOffset = 0;
    this.centerPos = 0;
    this.setupEventListener();
    this.renderMap();
  }

  renderMap(): void {
    MAP.forEach((row, rIndex) => {
      row.forEach((column, cIndex) => {
        switch (column) {
          case 0:
            break;

          case 1:
            this.platforms.push(
              new Element({
                x: cIndex * tileSize,
                y: rIndex * tileSize,
                type: 1,
              })
            );
            break;

          default:
            break;
        }
      });
    });
  }

  renderLoop(): void {
    this.ctx.clearRect(0, 0, maxMapWidth, this.canvas.height);
    this.mario.draw(this.ctx);
    this.platforms.forEach((platform) => {
      platform.draw(this.ctx);
    });
  }

  gameLoop(): void {
    this.centerPos = this.scrollOffset + viewPort / 2 - 120;
    this.mario.update();
    this.moveMario();
  }

  animate = (): void => {
    requestAnimationFrame(this.animate);

    this.renderLoop();
    this.gameLoop();
    this.marioPlatformCollision();
  };

  moveMario(): void {
    if (this.keys.left && this.keys.right) {
      this.mario.dx = 0;
      return;
    }

    if (this.keys.left && this.mario.x > this.scrollOffset) {
      this.mario.dx = -this.mario.speed;
      return;
    }

    // MarioPos < centerPos
    if (this.keys.right && this.mario.x < this.centerPos) {
      this.mario.dx = this.mario.speed;
      return;
    }

    this.mario.dx = 0;

    // MarioPos >= centerPos
    if (this.keys.right) {
      this.scrollOffset += 4;
      this.ctx.translate(-this.mario.speed, 0);
      return;
    }
  }

  marioPlatformCollision(): void {
    this.platforms.forEach((platform) => {
      if (
        this.mario.x + this.mario.width > platform.x &&
        this.mario.x < platform.x + platform.width &&
        this.mario.y + this.mario.height + this.mario.dy >= platform.y
      ) {
        this.mario.dy = 0;
      }
    });
  }

  setupEventListener() {
    addEventListener("keydown", (e) => {
      if (e.code === "KeyA") {
        this.keys.left = true;
        return;
      }
      if (e.code === "KeyD") {
        this.keys.right = true;
        return;
      }
      if (e.code === "Space" && !this.keys.space) {
        this.keys.space = true;
        this.mario.dy -= 18;
      }
    });

    addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyA":
          this.keys.left = false;
          break;

        case "KeyD":
          this.keys.right = false;
          break;

        case "Space":
          this.keys.space = false;
          break;
      }
    });
  }
}
