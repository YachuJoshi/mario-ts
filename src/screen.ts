import { createImage } from "./utils";
import { menuScreenContainer } from "./htmlElements";
import marioLogoSVG from "./images/mario-logo.svg";

export function showMenuScreen(): void {
  const marioLogo = createImage(marioLogoSVG);
  menuScreenContainer.appendChild(marioLogo);
  marioLogo.height = 300;
}
