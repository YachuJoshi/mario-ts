import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./base";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import { Platform } from "./platform";
import "./style.css";

interface Keys {
  [key: string]: boolean;
}

const { canvas, ctx } = initCanvas();
let scrollOffset: number = 0;
let centerPos: number;
const maxMapWidth = 6000;
const keys: Keys = {};
const mario = new Mario({
  x: 100,
  y: 100,
});
const platform = new Platform({
  x: 0,
  y: CANVAS_HEIGHT - 32,
});

const updateMario = (keys: Keys) => {
  if (keys.left && keys.right) {
    mario.dx = 0;
    return;
  }

  if (keys.left && mario.x > scrollOffset) {
    mario.dx = -mario.speed;
    return;
  }

  // MarioPos < centerPos
  if (keys.right && mario.x < centerPos) {
    mario.dx = mario.speed;
    return;
  }

  mario.dx = 0;

  // MarioPos >= centerPos
  if (keys.right) {
    scrollOffset += 4;
    ctx.translate(-mario.speed, 0);
    return;
  }
};

const marioPlatformCollision = () => {
  if (
    mario.x + mario.width > platform.x &&
    mario.x < platform.x + platform.width &&
    mario.y + mario.height + mario.dy >= platform.y
  ) {
    mario.dy = 0;
  }
};

const draw = () => {
  ctx.clearRect(0, 0, maxMapWidth, canvas.height);
  mario.draw(ctx);
  platform.draw(ctx);
};

const update = () => {
  centerPos = scrollOffset + CANVAS_WIDTH / 2 - 120;
  console.log(mario.x, centerPos, scrollOffset);
  updateMario(keys);
  mario.update();
};

const animate = () => {
  requestAnimationFrame(animate);

  draw();
  update();

  marioPlatformCollision();
};

animate();

addEventListener("keydown", (e) => {
  if (e.code === "KeyA") {
    keys.left = true;
    return;
  }
  if (e.code === "KeyD") {
    keys.right = true;
    return;
  }
  if (
    e.code === "Space" &&
    !keys.space &&
    mario.y + mario.height + mario.dy >= CANVAS_HEIGHT - 33
  ) {
    keys.space = true;
    mario.dy -= 20;
  }
});

addEventListener("keyup", (e) => {
  if (e.code === "KeyA") {
    keys.left = false;
    return;
  }
  if (e.code === "KeyD") {
    keys.right = false;
    return;
  }

  if (e.code === "Space") {
    keys.space = false;
    return;
  }
});
