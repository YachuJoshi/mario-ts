import { CANVAS_HEIGHT, CANVAS_WIDTH as viewPort, MAP } from "./base";
import { tileSize } from "./constants";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Element } from "./element";
import { Goomba } from "./goomba";
import { PowerUp } from "./powerup";
import { media } from "./media";
import { getCollisionDirection, getTileMapIndex } from "./utils";

interface Keys {
  [key: string]: boolean;
}

const maxMapWidth = MAP[0].length * tileSize;
const gravity = 0.8;
const blocks = [2, 3, 4];
const flags = [5, 6];
const pipes = [7, 8, 9, 10];
export class World {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mario: Mario;
  keys: Keys;
  elements: {
    [key: string]: Element[];
  };
  goombas: Goomba[];
  powerUps: PowerUp[];
  coins: number;
  centerPos: number;
  scrollOffset: number;
  lastKey: string;
  isGameActive: boolean;
  marioInGround: boolean;
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
      flags: [],
    };
    this.goombas = [];
    this.powerUps = [];
    this.centerPos = 0;
    this.lastKey = "right";
    this.scrollOffset = 0;
    this.setupEventListener();
    this.renderMap();
    this.isGameActive = true;
    media["themeSong"].loop = true;
    media["themeSong"].volume = 0.6;
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

        // 5, 6 ( FlagPole & Flag )
        if (flags.includes(column)) {
          this.elements["flags"].push(
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
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));
    this.mario.draw(this.ctx);
  }

  gameLoop = (): void => {
    this.centerPos = this.scrollOffset + viewPort / 2 - 120;
    this.mario.update();
    this.moveMario();
    this.goombas.forEach((goomba) => goomba.update());
    this.powerUps.forEach((powerUp) => {
      powerUp.update();
      powerUp.dy += gravity;
    });

    this.marioInGround = this.mario.isOnGround;

    if (this.mario.y + this.mario.height + this.mario.dy < CANVAS_HEIGHT) {
      this.mario.dy += gravity;
      this.mario.isOnGround = false;
    } else if (this.mario.y - 32 > CANVAS_HEIGHT) {
      this.isGameActive = false;
      media["marioDie"].play();
      media["themeSong"].pause();
      media["themeSong"].currentTime = 0;
      cancelAnimationFrame(this.gameAnimationFrame);

      setTimeout(this.restart, 3000);
    }
  };

  start = (): void => {
    this.gameAnimationFrame = requestAnimationFrame(this.start);

    this.renderLoop();
    this.gameLoop();
    this.checkMarioElementCollision(this.elements["pipes"]);
    this.checkMarioElementCollision(this.elements["blocks"]);
    this.checkGoombaElementCollision(this.elements["pipes"]);
    this.checkPowerUpElementCollision(this.elements["blocks"]);
    this.checkPowerUpElementCollision(this.elements["pipes"]);
    this.checkPowerUpPlatformCollision();
    this.checkMarioGoombaCollision();
    this.checkMarioPowerUpCollision();
    this.updateMarioSprite();
    this.checkMarioFlagCollision();
    this.checkMarioPlatformCollision();
  };

  restart = (): void => {
    this.init();
    this.start();
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
      if (this.mario.x >= maxMapWidth - 75) return;

      if (this.mario.x < maxMapWidth - viewPort / 2 - 160) {
        this.scrollOffset += 4;
        this.ctx.translate(-this.mario.speed, 0);
        return;
      }

      if (this.mario.x > maxMapWidth - this.centerPos) {
        this.mario.dx = this.mario.speed;
        return;
      }
    }

    return;
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

          if (element.type === 4) return;

          if (element.type === 2) {
            media["coinAudio"].play();
          }
          if (element.type === 3) {
            const { row, column } = getTileMapIndex(element);
            const type =
              this.mario.category === "small" ? "mushroom" : "flower";
            this.powerUps.push(
              new PowerUp({
                x: column * tileSize,
                y: (row - 1) * tileSize,
                type,
              })
            );
            media["powerUpAppear"].play();
          }

          // Change to empty block after hit
          element.type = 4;

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

      if (left) {
        this.mario.x += offset;

        if (this.lastKey === "left") this.mario.dx = 0;
        return;
      }

      if (right) {
        this.mario.x -= offset;

        if (this.lastKey === "right") this.mario.dx = 0;
        return;
      }
    });
  }

  checkMarioGoombaCollision(): void {
    this.goombas.forEach((goomba, index) => {
      if (goomba.state === "dead") return;
      if (this.mario.isInvulnerable) return;

      let dir = getCollisionDirection(this.mario, goomba);

      if (!dir) return;

      const { left, right, bottom, offset } = dir;
      console.log(dir);

      if (bottom) {
        goomba.state = "dead";
        this.mario.dy = -8;
        media["stomp"].play();

        setTimeout(() => {
          this.goombas.splice(index, 1);
        }, 800);

        return;
      }

      if ((left || right) && offset > 4) {
        if (this.mario.category === "small") {
          this.mario.frames = 13;
          this.isGameActive = false;
          media["marioDie"].play();
          media["themeSong"].pause();
          media["themeSong"].currentTime = 0;
          cancelAnimationFrame(this.gameAnimationFrame);

          setTimeout(this.restart, 3000);

          return;
        }

        dir = null;
        goomba.dx = -goomba.dx;
        this.mario.isInvulnerable = true;
        media["powerDown"].play();
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

  checkMarioPowerUpCollision(): void {
    this.powerUps.forEach((powerUp, index) => {
      const dir = getCollisionDirection(this.mario, powerUp);

      if (!dir) return;

      media["powerUp"].play();
      this.powerUps.splice(index, 1);

      if (this.mario.category === "small") {
        this.mario.category = "big";
        this.mario.y -= 16;
        return;
      }

      if (this.mario.category === "big") {
        this.mario.category = "super";
        return;
      }
    });
  }

  checkMarioFlagCollision(): void {
    const { flags } = this.elements;
    flags.forEach((flag) => {
      const dir = getCollisionDirection(this.mario, flag);
      if (!dir) return;

      const { left, right } = dir;

      this.mario.dx = 0;
      this.mario.dy = 2;

      if (left) {
        this.mario.frames = 10;
      }
      if (right) {
        this.mario.frames = 11;
      }

      if (this.marioInGround) {
        this.mario.tick++;

        if (this.mario.tick > this.mario.maxTick) {
          this.mario.x += 10;
          this.mario.frames = 12;
          this.isGameActive = false;

          setTimeout(() => cancelAnimationFrame(this.gameAnimationFrame), 100);
        }
      }
      media["stageClear"].play();
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

  checkPowerUpElementCollision(elementArray: Element[]): void {
    elementArray.forEach((element) => {
      this.powerUps.forEach((powerUp) => {
        const dir = getCollisionDirection(powerUp, element);

        if (!dir) return;

        const { left, right, top, bottom, offset } = dir;

        if (top) return;

        if (bottom) {
          // If element is a block ( Coin, Powerup, Empty )
          if (blocks.includes(element.type) || pipes.includes(element.type)) {
            powerUp.y -= offset;
            powerUp.dy = 0;
            return;
          }
        }

        // Left or Right
        powerUp.dx = -powerUp.dx;

        if (left) {
          powerUp.x += offset;
          return;
        }

        if (right) {
          powerUp.x -= offset;
          return;
        }
      });
    });
  }

  checkPowerUpPlatformCollision() {
    const { platforms } = this.elements;
    this.powerUps.forEach((powerUp) => {
      platforms.forEach((platform) => {
        if (
          powerUp.x + powerUp.width > platform.x &&
          powerUp.x < platform.x + platform.width &&
          powerUp.y + powerUp.height + powerUp.dy >= platform.y
        ) {
          powerUp.dy = 0;
        }
      });
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
    // this.canvas.addEventListener("click", () => {
    //   media["themeSong"].play();
    // });

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
      if (
        e.code === "Space" &&
        !this.keys.space &&
        !this.mario.isJumping &&
        this.mario.isOnGround
      ) {
        this.keys.space = true;
        this.mario.dy -= 13;

        if (!this.isGameActive) return;

        // Play Audio
        if (this.mario.category === "small") {
          media["jumpSmall"].play();
          return;
        }
        media["jumpBig"].play();
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
