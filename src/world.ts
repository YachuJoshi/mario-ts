import { CANVAS_WIDTH as viewPort, MAP } from "./base";
import { tileSize } from "./constants";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Element } from "./element";
import { getCollisionDirection } from "./utils";

interface Keys {
  [key: string]: boolean;
}

const maxMapWidth = MAP[0].length * 32;
const pipes = [7, 8, 9, 10];

export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  platforms: Element[];
  elements: {
    [key: string]: Element[];
  };
  keys: Keys;
  centerPos: number;
  scrollOffset: number;

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
    this.elements = {
      platforms: [],
      pipes: [],
    };
    this.scrollOffset = 0;
    this.centerPos = 0;
    this.setupEventListener();
    this.renderMap();
  }

  renderMap(): void {
    MAP.forEach((row, rIndex) => {
      row.forEach((column, cIndex) => {
        if (column === 0) return;

        if (column === 1) {
          this.elements["platforms"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: column,
            })
          );
          return;
        }

        if (pipes.includes(column)) {
          this.elements["pipes"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: column,
            })
          );
          return;
        }
      });
    });
  }

  renderLoop(): void {
    this.ctx.clearRect(0, 0, maxMapWidth, this.canvas.height);

    for (const elem in this.elements) {
      const element = this.elements[elem];
      element.forEach((item) => {
        item.draw(this.ctx);
      });
    }

    this.mario.draw(this.ctx);
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

    this.elements["pipes"].forEach((pipe) => {
      const dir = getCollisionDirection(this.mario, pipe);

      if (!dir) return;

      const { left, right, top, bottom } = dir;

      if (left) {
        this.mario.dx = 0;
        this.mario.x += 2;
        return;
      }

      if (right) {
        this.mario.dx = 0;
        this.mario.x -= 2;
        return;
      }

      if (top) {
        this.mario.dy *= 1;
        return;
      }

      if (bottom) {
        this.mario.y -= this.mario.dy;
        this.mario.dy = 0;
      }
    });
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
    const { platforms } = this.elements;
    platforms.forEach((platform) => {
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
