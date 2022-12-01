import * as PIXI from "pixi.js";
import { Controller } from "@hotwired/stimulus";
import { Grid } from "./game/grid";
import { PlayerController } from "./game/player";
import { findAssetInfo, loadAssets } from "./game/assets";
import { Buddy } from "./game/buddy";
import { Vector3 } from "./game/math";
import { Item } from "./game/item";

// Connects to data-controller="game"
export default class extends Controller {
  static values = {
    tilesConfig: String,
    tiles: String,
    itemsConfig: String,
    items: String,
    charactersConfig: String,
    characters: String,
  };

  async connect() {
    const tilesSpritesheetPath = this.tilesValue;
    const tilesConfigPath = this.tilesConfigValue;
    const itemsSpritesheetPath = this.itemsValue;
    const itemsConfigPath = this.itemsConfigValue;
    const charactersSpritesheetPath = this.charactersValue;
    const charactersConfigPath = this.charactersConfigValue;

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

    await loadAssets(
      app,
      tilesSpritesheetPath,
      tilesConfigPath,
      itemsSpritesheetPath,
      itemsConfigPath,
      charactersSpritesheetPath,
      charactersConfigPath
    );
    const grid = new Grid(app, 10, 10, (g) => {
      const deskCoord = new Vector3(4, 0, 1);
      const deskPosition = g.coordToWorld(deskCoord);
      const desk = new Item(app, findAssetInfo("desk"));
      desk.setScaledSize(
        desk.sprite.width * g.widthRatio,
        desk.sprite.height * g.heightRatio
      );
      desk.rotateCW();
      desk.x = deskPosition.x - desk.currentOffset.x;
      desk.y = deskPosition.y - desk.currentOffset.y;
      desk.y -= g.yValue / 2;
      g.setTileItem(desk, deskCoord);
    });
    app.stage.addChild(grid);

    const playerController = new PlayerController(app);
    const buddy = new Buddy(app, grid);
  }
}
