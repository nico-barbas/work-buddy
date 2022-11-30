import * as PIXI from "pixi.js";
import { Vector2 } from "./math";

const spritesheet = {
  tiles: {},
  items: {},
  characters: {},
};

export const loadAssets = async (
  app,
  tilesPath,
  tilesConfigPath,
  itemsPath,
  itemsConfigPath,
  charactersPath,
  charactersConfigPath
) => {
  const tilesAtlas = await parseAtlas(tilesConfigPath);
  tilesAtlas.meta.image = tilesPath;
  spritesheet.tiles = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(tilesAtlas.meta.image),
    tilesAtlas
  );
  await spritesheet.tiles.parse();

  const itemsAtlas = await parseAtlas(itemsConfigPath);
  itemsAtlas.meta.image = itemsPath;
  spritesheet.items = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(itemsAtlas.meta.image),
    itemsAtlas
  );
  await spritesheet.items.parse();

  const charactersAtlas = await parseAtlas(charactersConfigPath);
  charactersAtlas.meta.image = charactersPath;
  spritesheet.characters = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(charactersAtlas.meta.image),
    charactersAtlas
  );
  await spritesheet.characters.parse();
};

const parseAtlas = async (configPath) => {
  const atlas = { frames: {}, meta: {}, animations: {} };

  const fetcher = await fetch(configPath);
  const text = await fetcher.text();

  let frameName = "";
  let currentFrame = { frame: {}, sourceSize: {} };
  const lines = text.split("\n");
  for (let i = 2; i < lines.length; i += 1) {
    let line = lines[i];
    switch (i) {
      case 2:
        if (line.startsWith("size")) {
          const size = line.substring("size".length + 2).split(",");
          const width = parseInt(size[0]);
          const height = parseInt(size[1].trimStart());
          atlas.meta.size = {
            w: width,
            h: height,
          };
        }
        break;
      case 3:
        if (line.startsWith("format")) {
          const format = line.substring("format".length + 2).trim();
          atlas.meta.format = format;
        }
        break;
      case 4:
        break;
      case 5:
        break;
      default:
        if (line.charCodeAt(0) !== 32) {
          // store previous frame
          if (frameName != "") {
            currentFrame.sourceSize.w = currentFrame.frame.w;
            currentFrame.sourceSize.h = currentFrame.frame.h;
            currentFrame.spriteSourceSize = {
              x: 0,
              y: 0,
              w: currentFrame.sourceSize.w,
              h: currentFrame.sourceSize.h,
            };
            atlas.frames[frameName] = currentFrame;
          }

          // store next frame name
          frameName = line.trim();
          currentFrame = { frame: {}, sourceSize: {} };
        }

        line = line.trim();
        if (line.startsWith("xy")) {
          const xy = line.substring("xy".length + 2).split(",");
          currentFrame.frame.x = parseInt(xy[0]);
          currentFrame.frame.y = parseInt(xy[1].trimStart());
        } else if (line.startsWith("size")) {
          const size = line.substring("size".length + 2).split(",");
          currentFrame.frame.w = parseInt(size[0]);
          currentFrame.frame.h = parseInt(size[1].trimStart());
        }
        break;
    }
  }
  atlas.meta.scale = 1;
  Object.keys(atlas.frames).forEach((frameName) => {
    const animationName = frameName.replace(/\d+/g, "");
    if (!(animationName in atlas.animations)) {
      atlas.animations[animationName] = [];
    }
    atlas.animations[animationName].push(frameName);
  });

  return atlas;
};

export const getSpritesheetAnimation = (kind, name) => {
  switch (kind) {
    case "tile":
      return spritesheet.tiles.animations[name];
    case "item":
      return spritesheet.items.animations[name];
    case "character":
      return spritesheet.characters.animations[name];
  }
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
