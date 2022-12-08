import * as PIXI from "pixi.js";
import { Controller } from "@hotwired/stimulus";
import { Grid } from "./game/grid";
import { PlayerController } from "./game/player";
import {
  findAssetInfo,
  getSpritesheetAnimation,
  loadAssets,
} from "./game/assets";
import { Buddy } from "./game/buddy";
import { Vector2, Vector3 } from "./game/math";
import { Item } from "./game/item";
import {
  EmissionShape,
  ParticleEmitter,
  ParticleSystem,
  RotatingHoverItem,
} from "./game/particles";
import { secondToTick } from "./game/utils";

// Connects to data-controller="game"
export default class extends Controller {
  static values = {
    tilesConfig: String,
    tiles: String,
    itemsConfig: String,
    items: String,
    charactersConfig: String,
    characters: String,
    iconsConfig: String,
    icons: String,
  };

  async connect() {
    const tilesSpritesheetPath = this.tilesValue;
    const tilesConfigPath = this.tilesConfigValue;
    const itemsSpritesheetPath = this.itemsValue;
    const itemsConfigPath = this.itemsConfigValue;
    const charactersSpritesheetPath = this.charactersValue;
    const charactersConfigPath = this.charactersConfigValue;
    const iconsSpritesheetPath = this.iconsValue;
    const iconsConfigPath = this.iconsConfigValue;

    let app = new PIXI.Application({
      // width: window.innerWidth,
      // height: window.innerHeight,
      background: 0xffffff,
      resizeTo: this.element,
    });
    // background: 0xf2ecfd,

    document.body.style.margin = "0";
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";

    app.renderer.resize(window.innerWidth, window.innerHeight);
    this.element.appendChild(app.view);
    // document.body.appendChild(app.view);

    await loadAssets(
      app,
      tilesSpritesheetPath,
      tilesConfigPath,
      itemsSpritesheetPath,
      itemsConfigPath,
      charactersSpritesheetPath,
      charactersConfigPath,
      iconsSpritesheetPath,
      iconsConfigPath
    );
    const grid = new Grid(app, 10, 10, (g) => {
      const insertItem = (name, coord, rotationsCount) => {
        const position = g.coordToWorld(coord);
        const item = new Item(app, findAssetInfo(name));
        item.setScaledSize(
          item.sprite.width * g.widthRatio,
          item.sprite.height * g.heightRatio
        );
        for (let i = 0; i < rotationsCount; i += 1) {
          item.rotateCW();
        }
        item.x = position.x - item.currentOffset.x;
        item.y = position.y - item.currentOffset.y;
        item.y -= g.yValue / 2;
        g.setTileItem(item, coord);
        return item;
      };
      const insertNestedItem = (name, parent, rotationsCount, offset) => {
        const item = new Item(app, findAssetInfo(name));
        item.setScaledSize(
          item.sprite.width * g.widthRatio,
          item.sprite.height * g.heightRatio
        );
        for (let i = 0; i < rotationsCount; i += 1) {
          item.rotateCW();
        }
        item.x = -item.currentOffset.x;
        item.y = -item.currentOffset.y;
        parent.nestItem(item, offset);
      };

      const desk = insertItem("desk", new Vector3(4, 0, 1), 1);
      insertNestedItem("laptop", desk, 1, new Vector2(-30, 0));
      insertNestedItem("teaCup", desk, 0, new Vector2(-30, 0));
      // insertItem("rug", new Vector3(9, 0, 5), 0);
      insertItem("couch", new Vector3(1, 0, 5));
      insertItem("fridge", new Vector3(9, 0, 1), 1);
      insertItem("kitchenSink", new Vector3(8, 0, 1), 1);
      insertItem("plant", new Vector3(5, 0, 1));
      insertItem("plant", new Vector3(1, 0, 4), 1);
      insertItem("christmastree", new Vector3(1, 0, 1), 0);
      const kitchenCabinet = insertItem(
        "kitchenCabinet",
        new Vector3(7, 0, 1),
        1
      );
      insertNestedItem("coffeeMachine", kitchenCabinet, 1, new Vector2(-35, 5));
      const bookcase = insertItem("bookcase", new Vector3(1, 0, 8), 0);
      insertNestedItem("books", bookcase, 0, new Vector2(-30, 0));
      insertNestedItem("books", bookcase, 0, new Vector2(-30, -30));
      insertNestedItem("books", bookcase, 0, new Vector2(-30, -60));
      // insertItem("deskChair", new Vector3(4, 0, 2), 3);
      const table = insertItem("coffeeTable", new Vector3(3, 0, 5));
      insertNestedItem("tv", table, 2, new Vector2(0, 10));
      insertNestedItem("pizza", table, 0, new Vector2(-100, 0));
      const present = insertItem(
        "presentGreenRectangle",
        new Vector3(1, 0, 2),
        0
      );
      insertNestedItem("presentRedSquare", present, 0, new Vector2(-40, -5));
      insertNestedItem("presentGreenRound", present, 0, new Vector2(-100, 0));
      insertNestedItem("presentRed", present, 0, new Vector2(-70, -10));
    });
    app.stage.addChild(grid);

    const playerController = new PlayerController(app);
    const buddy = new Buddy(app, grid);

    ParticleSystem.init(app);
    window.addEventListener("resize", (e) => {
      app.renderer.resize(this.element.offsetWidth, this.element.offsetHeight);
    });
  }
}
