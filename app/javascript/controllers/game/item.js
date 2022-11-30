import { Container, Sprite, Application, AnimatedSprite } from "pixi.js";
import { getSpritesheetAnimation } from "./assets";
import { Vector2 } from "./math";
import { Direction } from "./utils";

export class Item extends Container {
  app;
  name;
  id;
  spriteScale = 1;
  gridScale = new Vector2(1, 1);
  pattern;
  tempStorage;
  rotationIndex = 0;

  textureWidth = 0;
  textureHeight = 0;
  origins;
  offsets;
  currentOffset = new Vector2();
  sprite;
  placed = false;
  blocking = true;

  // Info coming from a DB as a JSON/Record
  constructor(app, info) {
    super();
    this.app = app;
    this.name = info["name"];
    this.id = info["id"];
    this.spriteScale = info["scale"];
    this.gridScale = new Vector2(info["width"], info["height"]);
    this.pattern = new Array(this.gridScale.x);
    this.tempStorage = new Array(this.gridScale.y);

    const patternStr = info["pattern"];
    for (let x = 0; x < this.gridScale.x; x += 1) {
      this.pattern[x] = new Array(this.gridScale.y);
      this.tempStorage[x] = new Array(this.gridScale.y);
      for (let y = 0; y < this.gridScale.y; y += 1) {
        const index = y * this.gridScale.x + x;
        this.pattern[x][y] = patternStr[index] === "1";
      }
    }

    this.origins = info["origins"];

    this.sprite = new AnimatedSprite(
      getSpritesheetAnimation("item", info["name"])
    );
    this.textureWidth = this.sprite.width;
    this.textureHeight = this.sprite.height;
    this.addChild(this.sprite);
  }

  /** Rotate the furniture clockwise */
  rotateCW() {
    // Transpose the pattern matrix
    // Vertical reflexion of the rows
    for (let x = 0; x < this.gridScale.x; x += 1) {
      for (let y = 0; y < this.gridScale.y; y += 1) {
        this.tempStorage[x][y] = this.pattern[y][x];
      }
    }

    for (let x = 0; x < this.gridScale.x; x += 1) {
      for (let y = 0; y < this.gridScale.y; y += 1) {
        this.pattern[x][y] = this.tempStorage[x][y];
      }
    }

    for (let x = 0; x < Math.floor(this.gridScale.x / 2); x += 1) {
      for (let y = 0; y < this.gridScale.y; y += 1) {
        const invX = this.gridScale.x - 1 - x;
        const temp = this.pattern[x][y];
        this.pattern[x][y] = this.pattern[invX][y];
        this.pattern[invX][y] = temp;
      }
    }
    this.rotationIndex = (this.rotationIndex + 1) % 4;

    this.sprite.gotoAndStop(this.rotationIndex);
    // this.textureWidth = this.sprite.texture.width;
    // this.textureHeight = this.sprite.texture.height;
    this.currentOffset = this.offsets[this.rotationIndex];
  }

  debugLog() {
    let str = "";
    for (let y = 0; y < this.gridScale.y; y += 1) {
      for (let x = 0; x < this.gridScale.x; x += 1) {
        const v = this.pattern[x][y];
        str += v ? "x" : ".";
      }
      str += `\n`;
    }
    console.log(str);
  }

  setScaledSize(scaledWidth, scaledHeight) {
    this.width = scaledWidth;
    this.height = scaledHeight;

    this.offsets = this.origins.map((origin) => {
      return new Vector2(
        (origin.x / this.textureWidth) * scaledWidth,
        (origin.y / this.textureHeight) * scaledHeight
      );
    });
    this.currentOffset = this.offsets[Direction.Up];
  }
}
