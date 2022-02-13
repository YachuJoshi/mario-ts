declare module "*.png";
declare module "*.jpg";
declare module "*.svg";
declare module "*.mp3" {
  const src: string;
  export default src;
}
declare module "*.wav" {
  const src: string;
  export default src;
}
