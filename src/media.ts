import coinAudio from "./audio/coin.wav";
import jumpSmall from "./audio/jump-small.wav";
import jumpBig from "./audio/jump-big.wav";
import marioDie from "./audio/mario-die.wav";
import powerDown from "./audio/power-down.wav";
import powerUp from "./audio/power-up.wav";
import powerUpAppear from "./audio/power-up-appear.wav";
import stomp from "./audio/stomp.wav";
import stageClear from "./audio/stage-clear.wav";
import bullet from "./audio/bullet.wav";
import themeSong from "./audio/theme-song.mp3";

import { mediaNames } from "./constants";
import { createAudioElement } from "./utils";

interface Media {
  [key: string]: HTMLAudioElement;
}

const mediaSources = [
  coinAudio,
  jumpSmall,
  jumpBig,
  marioDie,
  powerDown,
  powerUp,
  powerUpAppear,
  stomp,
  stageClear,
  bullet,
  themeSong,
];

export let media: Media = {};

for (let i = 0; i < mediaSources.length; i++) {
  const mediaSrc = mediaSources[i];
  const audio = createAudioElement(mediaSrc);
  const mediaName = mediaNames[i];
  media[mediaName] = audio;
}
