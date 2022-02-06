import { CANVAS_HEIGHT, CANVAS_WIDTH as viewPort } from "./base";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Platform } from "./platform";

interface Keys {
  [key: string]: boolean;
}

const maxMapWidth = 6000;

export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  scrollOffset: number;
  centerPos: number;
  keys: Keys;
  platform: Platform;

  constructor() {
    this.init();
  }

  init(): void {
    const { canvas, ctx } = initCanvas();
    this.canvas = canvas;
    this.ctx = ctx;
    this.keys = {};
    this.mario = new Mario({
      x: 100,
      y: 100,
    });
    this.platform = new Platform({
      x: 0,
      y: CANVAS_HEIGHT - 32,
    });
    this.scrollOffset = 0;
    this.centerPos = 0;
    this.setupEventListener();
  }

  renderLoop(): void {
    this.ctx.clearRect(0, 0, maxMapWidth, this.canvas.height);
    this.mario.draw(this.ctx);
    this.platform.draw(this.ctx);
  }

  gameLoop(): void {
    this.centerPos = this.scrollOffset + viewPort / 2 - 120;
    this.mario.update();
    this.moveMario();
  }

  animate = (): void => {
    console.log(this.mario.x, this.centerPos, this.scrollOffset);
    requestAnimationFrame(this.animate);

    this.renderLoop();
    this.gameLoop();

    if (this.marioPlatformCollision()) {
      this.mario.dy = 0;
    }
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

  marioPlatformCollision = (): boolean => {
    return (
      this.mario.x + this.mario.width > this.platform.x &&
      this.mario.x < this.platform.x + this.platform.width &&
      this.mario.y + this.mario.height + this.mario.dy >= this.platform.y
    );
  };

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
      if (
        e.code === "Space" &&
        !this.keys.space &&
        this.mario.y + this.mario.height + this.mario.dy >= CANVAS_HEIGHT - 33
      ) {
        this.keys.space = true;
        this.mario.dy -= 20;
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
