import { OutlineFilter } from "pixi-filters";
import { Container, AnimatedSprite } from "pixi.js";
import { getSpritesheetAnimation, findAssetInfo } from "./assets";
import { Item } from "./item";
import { Vector2, Vector3, Matrix2x2 } from "./math";

export class Grid extends Container {
  constructor(app, w, h, defaultRoomCallback) {
    super();
    this.app = app;
    this.name = "grid";
    this.tiles = new Array(w * h);
    this.items = new Array();
    this.gridWidth = w;
    this.gridHeight = h;
    this.tileWidth = 128;
    this.tileHeight = 128;
    this.widthRatio = 128 / 256;
    this.heightRatio = 128 / 256;
    this.yValue = this.tileHeight * (2 / 4);
    this.tileCenterOffset = new Vector2(
      this.tileWidth / 2,
      this.tileHeight / 4
    );

    this.projection = Matrix2x2.from(
      0.5 * this.tileWidth,
      -0.5 * this.tileWidth,
      0.25 * this.tileHeight,
      0.25 * this.tileHeight
    );
    this.inverseProjection = this.projection.inverse();

    this.tileContainer = new Container();
    this.itemContainer = new Container();
    this.tiledItemContainer = new Container();

    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const coord = new Vector3(x, 0, y);
        let index = this.coordToIndex(coord);
        this.tiles[index] = new Tile(this, index, false);
        this.tileContainer.addChild(this.tiles[index].sprite);

        // // Setup the initial walls
        const wallInfo = findAssetInfo("wall");
        const wallWindowInfo = findAssetInfo("wallwindow");
        if (x === 0 || y === 0) {
          if (x != 0 || y != 0) {
            const screenPosition = this.coordToWorld(coord);
            const isWindow = x === 4 || y === 7;
            const item = new Item(app, isWindow ? wallWindowInfo : wallInfo);
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
            item.tiled = true;
            this.setTileItem(item, coord);
          }
        }
      }
    }
    const pixelWidth = w * this.tileWidth;
    const pixelHeight = h * (this.tileHeight / 2);

    this.x = window.innerWidth / 2;
    this.y = (window.innerHeight - pixelHeight) / 2;

    this.addChild(this.tileContainer);
    this.addChild(this.tiledItemContainer);
    this.addChild(this.itemContainer);

    const outlineClr = 0x4c1f20;
    this.tileContainer.filters = [new OutlineFilter(2, outlineClr, 0.25)];
    this.tiledItemContainer.filters = [new OutlineFilter(2, outlineClr, 0.25)];

    defaultRoomCallback(this);
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
  }

  sortItems() {
    this.items.sort((item1, item2) => {
      return item1.y - item2.y;
    });
    this.itemContainer.removeChildren();
    this.tiledItemContainer.removeChildren();
    this.items.forEach((item) => {
      if (item.tiled) {
        this.tiledItemContainer.addChild(item);
      } else {
        this.itemContainer.addChild(item);
      }
    });
  }

  setTileSprite(tile) {
    const animation = getSpritesheetAnimation("tile", "floor");
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

  setTileItem(item, at) {
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
            const tile = this.tiles[index];
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

    if (item.tiled) {
      this.tiledItemContainer.addChild(item);
    } else {
      this.itemContainer.addChild(item);
    }
    this.items.sort((item1, item2) => {
      return item1.y - item2.y;
    });
  }

  findItem(name) {
    const item = this.tiles.find((tile) => {
      if (tile.content && tile.content.name === name) {
        return true;
      }
    });

    return item;
  }

  addBuddy(buddy, at) {
    if (!this.coordInBounds(at)) {
      console.error("Buddy out of grid bounds");
      return;
    }

    const index = this.coordToIndex(at);
    if (!this.tiles[index].walkable) {
      console.error("Trying to place buddy at non-walkable tile coordinate");
      return;
    }

    const screenPosition = this.coordToWorld(at);
    this.items.push(buddy);
    buddy.setPosition(
      new Vector2(screenPosition.x - this.x, screenPosition.y - this.y)
    );
    this.tiles[index].setContent(buddy);
    this.itemContainer.addChild(buddy);
    this.sortItems();
  }

  moveBuddy(buddy, to) {
    if (!this.coordInBounds(to)) {
      console.error("Buddy out of grid bounds");
      return;
    }

    const index = this.coordToIndex(to);
    if (!this.tiles[index].walkable) {
      console.error("Trying to place buddy at non-walkable tile coordinate");
      return;
    }

    this.tiles[this.coordToIndex(buddy.currentCoord)].clearContent();

    const screenPosition = this.coordToWorld(to);
    buddy.setPosition(
      new Vector2(screenPosition.x - this.x, screenPosition.y - this.y)
    );
    this.tiles[index].setContent(buddy);
    this.sortItems();
  }

  adjacentTiles(coord) {
    const result = new Array();
    if (this.coordInBounds(coord)) {
      const current = new Vector3();
      current.x = coord.x;
      current.z = coord.z - 1;
      if (this.coordInBounds(current)) {
        result.push(this.tiles[this.coordToIndex(current)]);
      }

      current.x = coord.x + 1;
      current.z = coord.z;
      if (this.coordInBounds(current)) {
        result.push(this.tiles[this.coordToIndex(current)]);
      }

      current.x = coord.x;
      current.z = coord.z + 1;
      if (this.coordInBounds(current)) {
        result.push(this.tiles[this.coordToIndex(current)]);
      }

      current.x = coord.x - 1;
      current.z = coord.z;
      if (this.coordInBounds(current)) {
        result.push(this.tiles[this.coordToIndex(current)]);
      }
    }
    return result;
  }

  /** Basic A* algorithm implementation:
   * ~ For better perfomances, swap raw array for a heap
   */
  pathTo(start, end, opt) {
    // Scoped helper functions
    const searchMin = (set) => {
      let currentMin = Infinity;
      let index = -1;

      for (let i = 0; i < set.length; i += 1) {
        const node = set[i];
        if (node.fCost < currentMin) {
          index = i;
          currentMin = node.fCost;
        }
      }

      return index;
    };

    const calculateHeuristic = (current, end) => {
      return Math.abs(current.x - end.x) + Math.abs(current.z - end.z);
    };

    const setContains = (set, node) => {
      for (let i = 0; i < set.length; i += 1) {
        const n = set[i];
        if (node.tile.index == n.tile.index) {
          return [i, true];
        }
      }

      return [-1, false];
    };

    if (start.equal(end)) {
      return [[], true];
    }

    const startIndex = this.coordToIndex(start);
    const endIndex = this.coordToIndex(end);

    const startOk = !(opt.includeStart && !this.tiles[startIndex].walkable);
    const endOk = !(opt.includeEnd && !this.tiles[endIndex].walkable);

    if (!startOk && !endOk) {
      return [[], false];
    }

    const openSet = new Array();
    const closedSet = new Array();

    let endNode;
    let endFound = false;
    openSet.push(new NavigationNode(this.tiles[startIndex], null));
    while (openSet.length > 0 && !endFound) {
      const minIndex = searchMin(openSet);
      if (minIndex >= 0) {
        const current = openSet[minIndex];
        const currentCoord = this.indexToCoord(current.tile.index);
        openSet.splice(minIndex, 1);
        closedSet.push(current);

        const adjacents = this.adjacentTiles(currentCoord);
        for (let i = 0; i < adjacents.length; i += 1) {
          const result = adjacents[i];
          const next = new NavigationNode(result, current);
          next.gCost = current.gCost + 1;
          next.hCost = calculateHeuristic(currentCoord, end);
          next.fCost = next.gCost + next.hCost;

          // Are we done yet?
          if (result.index == endIndex) {
            closedSet.push(next);
            endNode = next;
            endFound = true;
            break;
          }

          const [opendIndex, inOpenSet] = setContains(openSet, next);
          let skipClosedSet = false;
          if (inOpenSet) {
            const other = openSet[opendIndex];
            if (next.fCost < other.fCost) {
              other.parent = next.parent;
              other.fCost = next.fCost;
            }
            skipClosedSet = true;
          }

          if (!skipClosedSet) {
            const [_, inClosedSet] = setContains(closedSet, next);
            if (!inClosedSet) {
              openSet.push(next);
            }
          }
        }
      }
    }

    if (endNode) {
      const path = new Array();
      let current = endNode;
      while (true) {
        if (!current.parent) {
          if (opt.includeStart) {
            path.push(current.tile);
          }
          break;
        }
        path.push(current.tile);
        current = current.parent;
      }

      if (!opt.includeEnd) {
        path.splice(0, 1);
      }
      return [path, true];
    }

    return [[], false];
  }
}

class NavigationNode {
  tile;
  parent;
  gCost = 0;
  hCost = 0;
  fCost = 0;

  constructor(tile, parent) {
    this.tile = tile;
    if (parent) {
      this.parent = parent;
    } else {
      this.parent = null;
    }
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

  clearContent() {
    this.content = null;
    this.walkable = true;
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
