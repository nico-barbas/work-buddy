import { Rectangle, Vector2, Vector3 } from "./math";
import { Application, Container, Filter, filters } from "pixi.js";
import { Grid, Tile } from "./grid";
// import { findAsset } from "./data/assets";
import { Item } from "./item";
import { Input } from "./input";
import { SignalDispatcher } from "./signal";

// PlayerController groups all the procedures related to handling
// the player's interactions with the game world or its UI
export class PlayerController {
  mode = new IdleMode();
  preview = new Container();

  constructor(app) {
    Input.init();
    app.stage.addChild(this.preview);
    this.preview.visible = false;

    // Set the default interaction mode to Idle
    this.mode = new IdleMode();
    const grid = app.stage.getChildByName("grid");

    // All the Room building UI interaction
    //
    // We define a lambda since otherwise the PlayerController
    // instance isn't accessible.
    //   const handleBuildInput = (event) => {
    //     const mode = event.target.dataset.buildMode;
    //     if (mode) {
    //       switch (mode) {
    //         case "remove":
    //           this.mode = new BuildMode(grid, true);
    //           break;
    //         case "floor":
    //           this.mode = new BuildMode(grid, false);
    //           break;
    //       }
    //     }
    //   };
    //   const buildItems = document.querySelectorAll<HTMLDivElement>(".build-item");
    //   buildItems.forEach((item) => {
    //     item.addEventListener("click", handleBuildInput);
    //   });

    //   const handleDecorationInput = (event: MouseEvent) => {
    //     const idStr = (event.target as HTMLElement).dataset.itemId;
    //     if (idStr) {
    //       const itemID = parseInt(idStr, 10);
    //       const mode = new DecorateMode(app, grid, itemID);
    //       this.preview.removeChildren();
    //       this.preview.addChild(mode.item);
    //       this.preview.visible = true;

    //       this.mode = mode;
    //     }
    //   };
    //   const decorationItems = document.querySelectorAll<HTMLDivElement>(
    //     ".decorate-item"
    //   );
    //   decorationItems.forEach((item) => {
    //     item.addEventListener("click", handleDecorationInput);
    //   });

    // All the game interactions that isn't handled by the UI
    const canvas = document.querySelector("canvas");
    if (canvas != null) {
      // We define a lambda since otherwise the PlayerController
      // instance isn't accessible.
      const handleMouseLeftInput = (event) => {
        const tile = grid.tileAt(Input.mouse);
        // Unwrap the result and check that we are clicking on a tile
        if (tile.ok) {
          switch (this.mode.kind) {
            case "idle":
              break;
            case "build":
              const buildMode = this.mode;
              buildMode.build(tile.value);
              break;
            case "decorate":
              this.preview.removeChildren();
              this.preview.visible = false;
              const decorateMode = this.mode;
              if (decorateMode.placeItem(grid.indexToCoord(tile.value.index))) {
                decorateMode.item.filters.length = 0;
                this.mode = new IdleMode();
              }
              break;
          }
        }
      };
      canvas.addEventListener("click", handleMouseLeftInput);

      const handleMouseRightInput = (event) => {
        // event.preventDefault();

        switch (this.mode.kind) {
          case "idle":
            break;
          case "build":
            break;
          case "decorate":
            const decorateMode = this.mode;
            decorateMode.item.rotateCW();
            break;
        }
      };
      canvas.addEventListener("contextmenu", handleMouseRightInput);

      SignalDispatcher.addListener("needsUpdated", (info) => {
        Object.entries(info).forEach((entry) => {
          const [key, value] = entry;
          const bar = document.querySelector(`#${key}`);
          bar.style.width = `${value}%`;
        });
      });
    }
  }

  initUpdateLoop(app, grid) {
    // FIXME: Consider using different margin for different screen resolutions
    const width = app.renderer.width;
    const height = app.renderer.height;
    const panMargin = 100;
    const panSpeed = 3;
    let panValue = new Vector2();
    const upRect = new Rectangle(0, 0, width, panMargin);
    const rightRect = new Rectangle(width - panMargin, 0, panMargin, height);
    const downRect = new Rectangle(0, height - panMargin, width, panMargin);
    const leftRect = new Rectangle(0, 0, panMargin, height);
    app.ticker.add(() => {
      if (upRect.inBounds(Input.mouse.x, Input.mouse.y)) {
        panValue.y = panSpeed;
      } else if (leftRect.inBounds(Input.mouse.x, Input.mouse.y)) {
        panValue.x = panSpeed;
      } else if (downRect.inBounds(Input.mouse.x, Input.mouse.y)) {
        panValue.y = -panSpeed;
      } else if (rightRect.inBounds(Input.mouse.x, Input.mouse.y)) {
        panValue.x = -panSpeed;
      }

      if (!panValue.isZero()) {
        grid.offsetOrigin(panValue);
      }

      panValue.x = 0;
      panValue.y = 0;
    });
  }
}

class IdleMode {
  kind = "idle";
}

class BuildMode {
  kind = "build";
  grid;
  remove;

  constructor(grid, remove) {
    this.grid = grid;
    // this.toKind = to;
    this.remove = remove;
  }

  build(tile) {
    this.grid.removeTile(tile);
    tile = new Tile(this.grid, tile.index, this.remove);
    // FIXME(nico): A bit hacky, it is to counter-balance the
    // tile selection effect
    tile.sprite.y -= 12;
    this.grid.addTile(tile);
  }
}

class DecorateMode {
  kind = "decorate";
  grid;
  item;
  isValidPosition = false;
  validFilter;

  constructor(app, grid, itemID) {
    this.grid = grid;

    const asset = findAsset(itemID);
    this.item = new Item(app, asset);
    this.item.setScaledSize(
      grid.tileWidth * this.item.spriteScale,
      grid.tileHeight * this.item.spriteScale
    );

    this.validFilter = new filters.ColorMatrixFilter();
    this.item.filters = [this.validFilter];
  }

  update() {
    const tile = this.grid.tileAt(Input.mouse);
    if (tile.ok) {
      const coord = this.grid.indexToCoord(tile.value.index);
      const screenPosition = this.grid.coordToWorld(coord);
      this.item.x = screenPosition.x - this.item.currentOffset.x;
      this.item.y = screenPosition.y - this.item.currentOffset.y;

      // FIXME: Fix this once proper height value  is being computed
      this.item.y -= this.grid.yValue / 2;

      this.isValidPosition = this.grid.validItemPosition(this.item, coord);
      if (this.isValidPosition) {
        const green = 0x00ff00;
        const r = (green >> 16) & 0xff;
        const g = (green >> 8) & 0xff;
        const b = green & 0xff;

        this.validFilter.reset();
        const matrix = this.validFilter.matrix;
        matrix[0] = r / 255;
        matrix[6] = g / 255;
        matrix[12] = b / 255;
      } else {
        const red = 0xff0000;
        const r = (red >> 16) & 0xff;
        const g = (red >> 8) & 0xff;
        const b = red & 0xff;

        this.validFilter.reset();
        const matrix = this.validFilter.matrix;
        matrix[0] = r / 255;
        matrix[6] = g / 255;
        matrix[12] = b / 255;
      }
    }
  }

  placeItem(at) {
    if (this.grid.validItemPosition(this.item, at)) {
      this.grid.setTileItem(this.item, at);
      return true;
    }

    return false;
  }
}
