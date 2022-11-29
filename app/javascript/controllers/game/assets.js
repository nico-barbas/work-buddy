import * as PIXI from "pixi.js";
import { Vector2 } from "./math";

let spritesheet = null;

export const setSpritesheet = async (data) => {
  spritesheet = data;
  await spritesheet.parse();
  console.log(spritesheet);
  spritesheet.baseTexture._scaleMode = PIXI.SCALE_MODES.NEAREST;
};

export const getSpritesheetAnimation = (name) => {
  return spritesheet.animations[name];
};

const itemAssets = [
  {
    name: "wall",
    origins: [new Vector2(135 - 256, 78), new Vector2(0, 78)],
    scale: 2,
    width: 1,
    height: 1,
    pattern: "1",
  },
];

export const findAssetInfo = (name) => {
  const item = itemAssets.find((item) => {
    if (item.name === name) {
      return true;
    }
  });
  return item;
};
