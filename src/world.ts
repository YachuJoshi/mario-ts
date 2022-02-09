import { CANVAS_WIDTH as viewPort, MAP } from "./base";
import { tileSize } from "./constants";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Element } from "./element";
import { Goomba } from "./goomba";
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
  elements: {
    [key: string]: Element[];
  };
  goombas: Goomba[];
  keys: Keys;
  coins: number;
  centerPos: number;
  scrollOffset: number;
  lastKey: string;
  gameAnimationFrame: number;

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
    this.goombas = [];
    this.scrollOffset = 0;
    this.centerPos = 0;
    this.setupEventListener();
    this.renderMap();
  }

  renderMap(): void {
    MAP.forEach((row, rIndex) => {
      row.forEach((column, cIndex) => {
        if (column === 0) return;

        // 1 ( Platform )
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

        // 2, 3, 4 ( Blocks )
        if (blocks.includes(column)) {
          this.elements["blocks"].push(
            new Element({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
              type: column,
            })
          );
        }

        // 7, 8, 9, 10 ( Pipes )
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

        // 12 ( Goomba )
        if (column === 12) {
          this.goombas.push(
            new Goomba({
              x: cIndex * tileSize,
              y: rIndex * tileSize,
            })
          );
          MAP[rIndex][cIndex] = 0;
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

    this.goombas.forEach((goomba) => goomba.draw(this.ctx));
    this.mario.draw(this.ctx);
  }

  gameLoop(): void {
    this.centerPos = this.scrollOffset + viewPort / 2 - 120;
    this.mario.update();
    this.moveMario();
    this.goombas.forEach((goomba) => goomba.update());
  }

  animate = (): void => {
    this.gameAnimationFrame = requestAnimationFrame(this.animate);

    this.renderLoop();
    this.gameLoop();
    this.checkMarioPlatformCollision();
    this.checkMarioElementCollision(this.elements["pipes"]);
    this.checkMarioElementCollision(this.elements["blocks"]);
    this.checkGoombaElementCollision(this.elements["pipes"]);
    this.checkMarioGoombaCollision();
    this.updateMarioSprite();
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
        this.mario.isJumping = false;
        this.mario.isOnGround = true;
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
        this.mario.isJumping = false;
        this.mario.isOnGround = true;
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

  checkGoombaElementCollision(elementArray: Element[]): void {
    elementArray.forEach((element) => {
      this.goombas.forEach((goomba) => {
        if (goomba.state === "dead") return;

        // Check collision for alive goombas
        const dir = getCollisionDirection(goomba, element);
        if (!dir) return;

        if (dir.left || dir.right) {
          goomba.dx = -goomba.dx;
          return;
        }
      });
    });
  }

  checkMarioGoombaCollision() {
    this.goombas.forEach((goomba, index) => {
      if (goomba.state === "dead") return;

      let dir = getCollisionDirection(this.mario, goomba);
      if (!dir) return;

      const { left, right, bottom } = dir;

      if (bottom) {
        goomba.state = "dead";
        this.mario.dy = -16;

        setTimeout(() => {
          this.goombas.splice(index, 1);
        }, 800);
        return;
      }

      if (left || right) {
        if (this.mario.category === "small") {
          cancelAnimationFrame(this.gameAnimationFrame);

          // setTimeout(() => {
          //   this.init();
          // }, 2000);

          return;
        }

        dir = null;
        goomba.dx = -goomba.dx;
        this.mario.isInvulnerable = true;
        setTimeout(() => {
          this.mario.isInvulnerable = false;
        }, 1000);

        if (this.mario.category === "big") {
          this.mario.category = "small";
          return;
        }

        if (this.mario.category === "super") {
          this.mario.category = "big";
          return;
        }
      }
    });
  }

  updateMarioSprite(): void {
    this.mario.updateSprite();

    if (this.keys.space) {
      this.mario.isJumping = true;
      this.mario.isOnGround = false;

      if (this.mario.frames === 0 || this.mario.frames === 1) {
        // Right Jump
        this.mario.frames = 3;
        return;
      }

      if (this.mario.frames === 8 || this.mario.frames === 9) {
        // Left Jump
        this.mario.frames = 2;
        return;
      }

      return;
    }

    if (this.keys.right) {
      if (!this.mario.isJumping) {
        this.mario.tick += 1;

        if (this.mario.tick > this.mario.maxTick / this.mario.speed) {
          this.mario.tick = 0;

          if (this.mario.frames === 0) {
            this.mario.frames = 1;
          } else {
            this.mario.frames = 0;
          }
        }
      }
      return;
    }

    if (this.keys.left) {
      if (!this.mario.isJumping) {
        this.mario.tick += 1;

        if (this.mario.tick > this.mario.maxTick / this.mario.speed) {
          this.mario.tick = 0;

          if (this.mario.frames === 9) {
            this.mario.frames = 8;
          } else {
            this.mario.frames = 9;
          }
        }
      }
      return;
    }

    if (this.mario.dx === 0 && this.mario.isOnGround) {
      if (this.lastKey === "right") {
        this.mario.frames = 0;
        return;
      }

      if (this.lastKey === "left") {
        this.mario.frames = 8;
        return;
      }
    }
  }

  setupEventListener() {
    addEventListener("keydown", (e) => {
      if (e.code === "KeyA") {
        this.keys.left = true;
        this.lastKey = "left";
        return;
      }
      if (e.code === "KeyD") {
        this.keys.right = true;
        this.lastKey = "right";
        return;
      }
      if (e.code === "Space" && !this.keys.space) {
        this.keys.space = true;
        this.mario.dy -= 16;
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
