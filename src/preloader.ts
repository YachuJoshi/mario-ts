const imageSources = [
  "images/elements.png",
  "images/goomba.png",
  "images/mario.png",
];

const audioSources = [
  "audio/bullet.wav",
  "audio/coin.wav",
  "audio/jump-small.wav",
  "audio/jump-big.wav",
  "audio/mario-die.wav",
  "audio/power-down.wav",
  "audio/power-up-appear.wav",
  "audio/power-up.wav",
  "audio/stage-clear.wav",
  "audio/stomp.wav",
  "audio/theme-song.mp3",
];

async function preload() {
  try {
    const images = await Promise.all(imageSources.map((image) => fetch(image)));
    const audio = await Promise.all(audioSources.map((audio) => fetch(audio)));
    return { images, audio };
  } catch (e) {
    console.log(e);
    return;
  }
}

export class Preloader {
  constructor() {
    this.init();
  }

  async init() {
    const response = await preload();
    console.log(response);
  }
}
