import { tileSize } from "./constants";

interface GameElement {
  x: number;
  y: number;
  width: number;
  height: number;
  dy?: number;
}

export function createImage(src: string): HTMLImageElement {
  const image = new Image();
  image.src = src;
  return image;
}

export function getCollisionDirection(
  elementA: GameElement,
  elementB: GameElement
) {
  if (
    elementA.x + elementA.width >= elementB.x &&
    elementA.x <= elementB.x + elementB.width &&
    elementA.y + elementA.height >= elementB.y &&
    elementA.y <= elementB.y + elementB.height
  ) {
    const topDiff = elementB.y + elementB.height - elementA.y;
    const bottomDiff = elementA.y + elementA.height - elementB.y;
    const leftDiff = elementB.x + elementB.width - elementA.x;
    const rightDiff = elementA.x + elementA.width - elementB.x;

    const offset = Math.min(bottomDiff, topDiff, leftDiff, rightDiff);

    return {
      bottom: bottomDiff === offset,
      right: rightDiff === offset,
      left: leftDiff === offset,
      top: topDiff === offset,
      offset,
    };
  }

  return null;
}

export function getTileMapIndex(element: GameElement) {
  return { row: element.y / tileSize, column: element.x / tileSize };
}
