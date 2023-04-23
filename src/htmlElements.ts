import CoinImage from "./images/coin.png";

export const menuScreenContainer = <HTMLElement>(
  document.querySelector(".menu-screen-container")
);
export const startGameBtn = <HTMLButtonElement>(
  document.querySelector(".start-game-btn")
);
export const mainMenuContainer = <HTMLElement>(
  document.querySelector(".main-screen-container")
);

export const scoreTextElement = <HTMLSpanElement>document.createElement("span");
scoreTextElement.classList.add("score-text");
mainMenuContainer.appendChild(scoreTextElement);

export const coinTextElement = <HTMLSpanElement>document.createElement("span");
coinTextElement.classList.add("coin-text");
mainMenuContainer.appendChild(coinTextElement);

export const coinImageElement = <HTMLImageElement>document.createElement("img");
coinImageElement.src = CoinImage;
coinImageElement.classList.add("coin-image");
mainMenuContainer.appendChild(coinImageElement);
