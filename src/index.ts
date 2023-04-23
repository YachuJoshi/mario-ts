import { World } from "./world";
import {
  menuScreenContainer,
  startGameBtn,
  mainMenuContainer,
} from "./htmlElements";
import { showMenuScreen } from "./screen";
import "./style.css";

showMenuScreen();
startGameBtn.addEventListener("click", () => {
  menuScreenContainer.style.display = "none";
  mainMenuContainer.style.display = "block";

  const world = new World();
  world.animate();
  world.startGameUpdateInterval();
});
