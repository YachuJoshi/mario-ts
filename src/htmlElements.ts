export const menuScreenContainer = <HTMLElement>(
  document.querySelector(".menu-screen-container")
);
export const startGameBtn = <HTMLButtonElement>(
  document.querySelector(".start-game-btn")
);
export const mainMenuContainer = <HTMLElement>(
  document.querySelector(".main-screen-container")
);

export const scoreTextElement = <HTMLDivElement>document.createElement("div");
scoreTextElement.classList.add("score-text");
mainMenuContainer.appendChild(scoreTextElement);
