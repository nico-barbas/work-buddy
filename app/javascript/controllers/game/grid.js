import { Container, AnimatedSprite } from "pixi.js";
import { getSpritesheetAnimation, findAssetInfo } from "./assets";
import { Item } from "./item";
import { Vector2, Vector3, Matrix2x2 } from "./math";

export class Grid extends Container {
  constructor(app, w, h) {
    super();
    this.app = app;
    this.name = "grid";
    this.tiles = new Array(w * h);
    this.items = new Array();
    this.gridWidth = w;
    this.gridHeight = h;
    this.tileWidth = 64;
    this.tileHeight = 64;
    this.widthRatio = 64 / 256;
    this.heightRatio = 64 / 256;
    this.yValue = this.tileHeight * (2 / 4);

    this.projection = Matrix2x2.from(
      0.5 * this.tileWidth,
      -0.5 * this.tileWidth,
      0.25 * this.tileHeight,
      0.25 * this.tileHeight
    );
    this.inverseProjection = this.projection.inverse();
    this.tileContainer = new Container();
    this.itemContainer = new Container();

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const coord = new Vector3(x, 0, y);
        let index = this.coordToIndex(coord);
        this.tiles[index] = new Tile(this, index, false);
        this.tileContainer.addChild(this.tiles[index].sprite);

        const wallInfo = findAssetInfo("wall");
        // // Setup the initial walls
        if (x === 0 || y === 0) {
          if (x != 0 || y != 0) {
            const screenPosition = this.coordToWorld(coord);
            const item = new Item(app, wallInfo);
            item.setScaledSize(
              item.sprite.width * this.widthRatio,
              item.sprite.height * this.heightRatio
            );
            if (y == 0) {
              item.rotateCW();
            }
            item.x = screenPosition.x - item.currentOffset.x;
            item.y = screenPosition.y - item.currentOffset.y;
            item.y -= this.yValue / 2;

            console.log(item.x, item.y, item.width, item.height);
            this.insertItem(item, coord);
          }
        }
      }
    }
    this.addChild(this.tileContainer);
    this.addChild(this.itemContainer);
  }

  offsetOrigin(v) {
    this.x += v.x;
    this.y += v.y;
  }

  addTile(tile) {
    this.tiles[tile.index] = tile;
    this.sortTiles();
  }

  removeTile(tile) {
    this.tileContainer.removeChild(this.tiles[tile.index].sprite);
  }

  // FIXME: Pretty bad sorting algorithm
  sortTiles() {
    this.tileContainer.removeChildren();
    for (let y = 0; y < this.gridHeight; y += 1) {
      for (let x = 0; x < this.gridHeight; x += 1) {
        let index = this.coordToIndex(new Vector3(x, 0, y));
        this.tileContainer.addChild(this.tiles[index].sprite);
      }
    }
    // this.addChild(this.itemContainer);
  }

  setTileSprite(tile) {
    const animation = getSpritesheetAnimation("floor");
    tile.sprite = new AnimatedSprite(animation);
    tile.sprite.width = this.tileWidth;
    tile.sprite.height = this.tileHeight;
  }

  tileAt(p) {
    const coord = this.worldToCoord(p);
    if (this.coordInBounds(coord)) {
      const index = this.coordToIndex(coord);
      return this.tiles[index];
    }

    return null;
  }

  validIndex(index) {
    const coord = this.indexToCoord(index);
    return this.coordInBounds(coord);
  }

  // Convert an index in the tile array into a 2D grid coordinate
  indexToCoord(index) {
    return new Vector3(
      index % this.gridWidth,
      0,
      Math.floor(index / this.gridWidth)
    );
  }

  // Convert an index in the tile array into a world space Vector2
  indexToWorld(index) {
    const coord = this.indexToCoord(index);
    return this.coordToWorld(coord);
  }

  // Convert a 2D grid coordinate into a index in the tile array
  coordToIndex(coord) {
    return coord.z * this.gridWidth + coord.x;
  }

  // Convert a 2D grid coordinate into a world space Vector2
  coordToWorld(coord) {
    // NOTE(nico): Some math magic here. Offsetting by half the tile width
    // make the transformation in both ways visually correct.
    let result = this.projection.vectorMult(new Vector2(coord.x, coord.z));
    result.x += this.x - this.tileWidth / 2;
    result.y += this.y;
    return result;
  }

  coordToWorldFloat(coord) {
    let result = this.projection.vectorMult(new Vector2(coord.x, coord.z));
    result.x += this.x;
    result.y += this.y;
    return result;
  }

  // Convert a world space Vector2 into a 2D grid coordinate
  worldToCoord(v) {
    const localV = v.sub(new Vector2(this.x, this.y));
    const result = this.inverseProjection.vectorMult(localV).floor();
    return new Vector3(result.x, 0, result.y);
  }

  coordInBounds(coord) {
    return (
      coord.x >= 0 &&
      coord.x < this.gridWidth &&
      coord.z >= 0 &&
      coord.z < this.gridHeight
    );
  }

  // validItemPosition(item, at) {
  //   let current = new Vector3();
  //   for (let x = 0; x < item.pattern.length; x += 1) {
  //     const col = item.pattern[x];
  //     for (let z = 0; z < col.length; z += 1) {
  //       current.x = at.x + x;
  //       current.z = at.z + z;

  //       if (item.pattern[x][z]) {
  //         if (this.coordInBounds(current)) {
  //           const tile = this.tiles[this.coordToIndex(current)];
  //           if (!tile.walkable) {
  //             return false;
  //           }
  //         } else {
  //           return false;
  //         }
  //       }
  //     }
  //   }

  //   return true;
  // }

  insertItem(item, at) {
    this.items.push(item);
    item.x -= this.x;
    item.y -= this.y;

    let current = new Vector3();
    for (let x = 0; x < item.pattern.length; x += 1) {
      const col = item.pattern[x];
      for (let z = 0; z < col.length; z += 1) {
        current.x = at.x + x;
        current.z = at.z + z;
        const index = this.coordToIndex(current);

        if (item.pattern[x][z]) {
          if (this.coordInBounds(current)) {
            const tile = this.tiles[this.coordToIndex(current)];
            if (!tile.walkable) {
              return;
            }
            this.tiles[index].setContent(item);
          } else {
            return;
          }
        }
      }
    }

    this.itemContainer.addChild(item);
    this.items.sort((item1, item2) => {
      return item1.y - item2.y;
    });
  }
}

export class Tile {
  constructor(grid, index = 0, empty) {
    this.grid = grid;
    this.index = index;
    this.width = 1;
    this.height = 1;
    this.empty = empty;
    this.walkable = true;
    this.content = null;

    grid.setTileSprite(this);
    const screenPos = grid.indexToWorld(this.index);
    this.sprite.x = screenPos.x;
    this.sprite.y = screenPos.y;

    if (this.empty) {
      this.hideTile();
    }
  }

  withSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  setContent(content) {
    this.content = content;
    if (content) {
      if (content.blocking) {
        this.walkable = false;
      }
    }
  }

  hideTile() {
    this.sprite.visible = false;
    this.sprite.interactive = false;
  }

  isOpen() {
    return this.content == null;
  }
}
