import * as PIXI from "pixi.js";
import { Controller } from "@hotwired/stimulus";
import { Grid } from "./game/grid";
import { PlayerController } from "./game/player";
import { setSpritesheet } from "./game/assets";

const load = async (app, assetPath) => {
  const assetResolution = 256;
  const atlasData = {
    frames: {
      floor01: {
        frame: { x: 0, y: 0, w: assetResolution, h: assetResolution },
        sourceSize: { w: assetResolution, h: assetResolution },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: assetResolution,
          h: assetResolution,
        },
      },
      wall01: {
        frame: { x: 257, y: 1, w: 135, h: 270 },
        sourceSize: { w: 135, h: 270 },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: 135,
          h: 270,
        },
      },
      wall02: {
        frame: { x: 393, y: 1, w: 135, h: 270 },
        sourceSize: { w: 135, h: 270 },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: 135,
          h: 270,
        },
      },
    },
    meta: {
      image: assetPath,
      format: "RGBA8888",
      size: { w: assetResolution, h: assetResolution },
      scale: 1,
    },
    animations: {
      floor: ["floor01"],
      wall: ["wall01", "wall02"],
    },
  };

  const spritesheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from(atlasData.meta.image),
    atlasData
  );
  await setSpritesheet(spritesheet);
};

// Connects to data-controller="game"
export default class extends Controller {
  static values = { assets: String };

  connect() {
    const spritesheetPath = this.assetsValue;
    // console.log(spritesheetPath);
    let app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    document.body.style.margin = "0";
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";

    app.renderer.resize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", (e) => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    });
    document.body.appendChild(app.view);

    load(app, spritesheetPath);
    const grid = new Grid(app, 10, 10);
    app.stage.addChild(grid);

    const playerController = new PlayerController(app);
  }
}
