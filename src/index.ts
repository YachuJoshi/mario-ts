import { CANVAS_HEIGHT } from "./base";
import { initCanvas } from "./canvas";
import { Mario } from "./mario";
import "./style.css";

interface Keys {
  [key: string]: boolean;
}

const { canvas, ctx } = initCanvas();
const keys: Keys = {};
const mario = new Mario({
  x: 100,
  y: 100,
});

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  mario.draw(ctx);
};

const updateMarioDirection = (keys: Keys) => {
  if (keys.left && keys.right) {
    mario.direction = "idle";
    return;
  }
  if (keys.left) {
    mario.direction = "left";
    return;
  }
  if (keys.right) {
    mario.direction = "right";
    return;
  }
  mario.direction = "idle";
};

const update = () => {
  updateMarioDirection(keys);
  mario.update();
};

const animate = () => {
  requestAnimationFrame(animate);

  draw();
  update();
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
    mario.y + mario.height + mario.dy >= CANVAS_HEIGHT
  ) {
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
});
