import { CANVAS_WIDTH as viewPort, MAP } from "./base";
import { tileSize } from "./constants";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Element } from "./element";
import { getCollisionDirection, getTileMapIndex } from "./utils";

interface Keys {
  [key: string]: boolean;
}

const maxMapWidth = MAP[0].length * 32;
const pipes = [7, 8, 9, 10];
const blocks = [2, 3, 4];

export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  platforms: Element[];
  elements: {
    [key: string]: Element[];
  };
  keys: Keys;
  coins: number;
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
      blocks: [],
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

        // 2, 3, 4
        if (blocks.includes(column)) {
          this.elements["blocks"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: column,
            })
          );
        }

        // 7, 8, 9, 10
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
    this.checkMarioPlatformCollision();
    this.checkMarioElementCollision(this.elements["pipes"]);
    this.checkMarioElementCollision(this.elements["blocks"]);
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

  checkMarioPlatformCollision(): void {
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

  checkMarioElementCollision(elementArray: Element[]): void {
    elementArray.forEach((element) => {
      const dir = getCollisionDirection(this.mario, element);

      if (!dir) return;
      const { left, right, top, bottom, offset } = dir;

      if (top) {
        // If element is a block ( Coin, Powerup, Empty )
        if (blocks.includes(element.type)) {
          this.mario.y += offset * 1.2;
          this.mario.dy = -this.mario.dy;

          // Change to empty block after hit
          if (element.type === 2 || element.type === 3) {
            const { row, column } = getTileMapIndex(element);
            MAP[row][column] = 4;
            element.type = 4;
          }

          return;
        }
        return;
      }

      if (bottom) {
        this.mario.y -= offset;
        this.mario.dy = 0;
        return;
      }

      this.mario.dx = 0;

      if (left) {
        this.mario.x += 2;
        return;
      }

      if (right) {
        this.mario.x -= 2;
        return;
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
