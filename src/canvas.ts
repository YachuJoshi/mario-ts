import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./base";

interface CanvasReturn {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export const initCanvas = (): CanvasReturn => {
  const canvas = <HTMLCanvasElement>document.getElementById("canvas")!;
  const ctx = canvas.getContext("2d")!;
  canvas.height = CANVAS_HEIGHT;
  canvas.width = CANVAS_WIDTH;

  return { canvas, ctx };
};
