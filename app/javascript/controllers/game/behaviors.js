import { getSpritesheetAnimation } from "./assets";
import { Vector2 } from "./math";
import {
  EmissionShape,
  ParticleEmitter,
  ParticleSystem,
  RotatingHoverItem,
} from "./particles";
import { secondToTick } from "./utils";

export class BehaviorTree {
  blackboard = {};
  root = null;

  constructor() {}

  setRoot(node) {
    this.root = node;
  }

  run() {
    let result = BehaviorResult.Success;
    if (this.root) {
      result = this.root.execute();
    }
    return result;
  }

  interrupt() {
    if (this.blackboard.runningNode && this.blackboard.runningNode.cleanup) {
      this.blackboard.runningNode.interrupt();
    }
  }
}

export const BehaviorResult = {
  Success: 0,
  Failure: 1,
  Processing: 2,
  Error: 3,
};

export class BehaviorSequence {
  kind = "sequence";
  blackboard = null;
  children = [];
  exitCode = BehaviorResult.Failure;

  constructor(blackboard, exitCode = BehaviorResult.Failure) {
    this.blackboard = blackboard;
    this.exitCode = exitCode;
    if (this.exitCode == BehaviorResult.Success) {
      this.kind = "selector";
    }
  }

  addChild(node) {
    this.children.push(node);
  }

  execute() {
    let result = BehaviorResult.Success;
    for (let i = 0; i < this.children.length; i += 1) {
      const child = this.children[i];
      result = child.execute();

      if (result === this.exitCode || result === BehaviorResult.Processing) {
        break;
      }
    }

    return result;
  }
}

export class BehaviorBranch {
  kind = "branch";
  blackboard = null;

  constructor(blackboard, predicate, left, right) {
    this.predicate = predicate;
    this.left = left;
    this.right = right;
  }

  execute() {
    switch (this.predicate.execute()) {
      case BehaviorResult.Success:
        return this.left.execute();
      case BehaviorResult.Failure:
        return this.right.execute();
      default:
        return BehaviorResult.Error;
    }
  }
}

export class BehaviorCondition {
  kind = "condition";

  constructor(blackboard, callback) {
    this.blackboard = blackboard;
    this.callback = callback;
  }

  execute() {
    const ok = this.callback(this.blackboard);
    return ok ? BehaviorResult.Success : BehaviorResult.Failure;
  }
}

export class BehaviorAction {
  kind = "action";

  constructor(blackboard, callback, cleanup) {
    this.blackboard = blackboard;
    this.callback = callback;
    this.cleanup = cleanup;
  }

  execute() {
    const done = this.callback(this.blackboard);
    if (done) {
      return BehaviorResult.Success;
    } else {
      this.blackboard.runningNode = this;
      return BehaviorResult.Processing;
    }
  }

  interrupt() {
    this.cleanup(this.blackboard);
  }
}

// All the premade Behaviors

export const celebrateBehavior = (blackboard) => {
  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      return b.celebrate.shouldCelebrate;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (!b.agentData.moodDisplay.playing) {
        b.agentData.moodDisplay.play("celebrate");
      }
      return !b.agentData.animation.playing;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.celebrate.shouldCelebrate = false;
      return true;
    })
  );

  return behavior;
};

export const singBehavior = (blackboard) => {
  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      return b.celebrate.shouldSing;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (!b.agentData.moodDisplay.playing) {
        b.agentData.moodDisplay.play("sing");
      }
      return !b.agentData.animation.playing;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.celebrate.shouldSing = false;
      return true;
    })
  );

  return behavior;
};

export const expressMoodBehavior = (blackboard) => {
  const happyMoods = ["happy", "daydream"];
  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      return !b.agentData.moodDisplay.playing;
    })
  );
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      b.mood.timer += 1;
      if (b.mood.timer >= b.mood.rate) {
        b.mood.timer = 0;
        return true;
      }
      return false;
    })
  );
  behavior.addChild(
    new BehaviorBranch(
      blackboard,
      // Is any need low enough?
      new BehaviorCondition(blackboard, (b) => {
        b.mood.lowNeeds = b.agentData.needs.lowNeeds();
        return b.mood.lowNeeds.length > 0;
      }),
      // If so select the need with the highest mood weight
      new BehaviorAction(blackboard, (b) => {
        b.mood.lowNeeds.sort((a, b) => {
          a.moodWeight > b.moodWeight;
        });

        b.mood.selected = b.mood.lowNeeds[0];
        return true;
      }),
      // Else, we just select one of the happy mood expression randomly
      new BehaviorAction(blackboard, (b) => {
        const randomIndex = Math.floor(Math.random() * happyMoods.length);
        b.mood.selected = happyMoods[randomIndex];
        return true;
      })
    )
  );
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      return b.mood.selected !== "";
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.agentData.moodDisplay.play(b.mood.selected);
      return true;
    })
  );

  return behavior;
};

export const workBehavior = (blackboard) => {
  const moveToDeskBehavior = new BehaviorSequence(blackboard);
  moveToDeskBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.itemLookup = "desk";
      return true;
    })
  );
  moveToDeskBehavior.addChild(findPathBehavior(blackboard));
  moveToDeskBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (b.move.timer + 1 === b.move.rate) {
        b.lock = "none";
      } else {
        b.lock = "work";
      }
      return true;
    })
  );
  moveToDeskBehavior.addChild(moveAlongPathBehavior(blackboard));
  moveToDeskBehavior.addChild(lookAtItemBehavior(blackboard));
  moveToDeskBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.pathFound = false;
      b.work.atDesk = true;
      return true;
    })
  );

  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      const filters = ["work", "none"];
      const isLocked = !filters.find((filter) => {
        return filter == b.lock;
      });
      if (!isLocked) {
        return b.work.hasWork;
      }
      return false;
    })
  );
  behavior.addChild(
    new BehaviorBranch(
      blackboard,
      new BehaviorCondition(blackboard, (b) => {
        return b.work.atDesk;
      }),
      new BehaviorAction(
        blackboard,
        (b) => {
          b.lock = "none";
          return false;
        },
        (b) => {
          b.lock = "none";
          b.work.atDesk = false;
          b.atTarget = false;
        }
      ),
      moveToDeskBehavior
    )
  );

  return behavior;
};

const findPathBehavior = (blackboard) => {
  return new BehaviorCondition(blackboard, (b) => {
    if (!b.pathFound) {
      const grid = b.agentData.grid;
      let tile;
      if (b.multipleItems) {
        const tiles = grid.findItems(b.itemLookup);
        tile = tiles[Math.floor(Math.random() * tiles.length)];
        b.multipleItems = false;
      } else {
        tile = grid.findItem(b.itemLookup);
      }
      if (tile) {
        const coord = grid.indexToCoord(tile.index);
        b.target = tile;
        const interactCoord = coord.add(
          tile.content.rotationIndexToDirectionVector()
        );
        [b.path, b.pathFound] = grid.pathTo(
          b.agentData.currentCoord,
          interactCoord,
          {
            includeStart: false,
            includeEnd: true,
          }
        );

        if (b.pathFound) {
          b.pathEmpty = b.path.length === 0;
          if (!b.pathEmpty) {
            b.nextCoord = grid.indexToCoord(b.path.pop().index);
            const dir = b.nextCoord.sub(b.agentData.currentCoord).normalize();
            b.agentData.lookAt(dir);
          }
        }
      }
    }
    return b.pathFound;
  });
};

const moveAlongPathBehavior = (blackboard) => {
  return new BehaviorAction(blackboard, (b) => {
    if (b.pathEmpty) {
      return true;
    }

    const grid = b.agentData.grid;

    b.move.timer += 1;
    if (b.move.timer === b.move.rate) {
      b.move.timer = 0;
      grid.moveBuddy(b.agentData, b.nextCoord);
      b.previousCoord = b.agentData.currentCoord;
      b.agentData.currentCoord = b.nextCoord;
      if (b.path.length > 0) {
        b.nextCoord = grid.indexToCoord(b.path.pop().index);

        const dir = b.nextCoord.sub(b.agentData.currentCoord).normalize();
        b.agentData.lookAt(dir);
        return false;
      }
      return true;
    }

    const t = b.move.timer / b.move.rate;
    // FIXME: Could optimize this since they are constant across the movement
    const start = grid.coordToWorld(b.agentData.currentCoord);
    const end = grid.coordToWorld(b.nextCoord);
    const v = start.lerp(end, t);
    b.agentData.setPosition(new Vector2(v.x - grid.x, v.y - grid.y));
    return false;
  });
};

const lookAtItemBehavior = (blackboard) => {
  return new BehaviorAction(blackboard, (b) => {
    const grid = b.agentData.grid;
    // const tile = grid.findItem(b.itemLookup);
    const tile = b.target;
    const coord = grid.indexToCoord(tile.index);
    const dir = coord.sub(b.agentData.currentCoord).normalize();
    b.agentData.lookAt(dir);
    return true;
  });
};

export const refillNeedBehavior = (blackboard, opt) => {
  const moveToSource = new BehaviorSequence(blackboard);
  moveToSource.addChild(findPathBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (b.move.timer + 1 === b.move.rate) {
        b.lock = "none";
      } else {
        b.lock = opt.lock;
      }
      return true;
    })
  );
  moveToSource.addChild(moveAlongPathBehavior(blackboard));
  moveToSource.addChild(lookAtItemBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.food.atFoodSource = true;
      b.pathFound = false;
      b.agentData.moodDisplay.play(opt.mood);
      return true;
    })
  );

  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      const ok = b.agentData.needs.isLow(opt.need);
      if (ok) {
        b.itemLookup = opt.item;
      }
      return ok;
    })
  );
  behavior.addChild(
    new BehaviorBranch(
      blackboard,
      new BehaviorCondition(blackboard, (b) => {
        return b.food.atFoodSource;
      }),
      new BehaviorAction(blackboard, (b) => {
        const done = !b.agentData.moodDisplay.playing;
        if (done) {
          b.agentData.needs.increaseValue(opt.need, opt.refillValue);
          b.atTarget = false;
          b.food.atFoodSource = false;
        }
        return done;
      }),
      moveToSource
    )
  );

  return behavior;
};

export const waterPlantBehavior = (blackboard) => {
  const moveToSource = new BehaviorSequence(blackboard);
  moveToSource.addChild(findPathBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (b.move.timer + 1 === b.move.rate) {
        b.lock = "none";
      } else {
        b.lock = "waterPlant";
      }
      return true;
    })
  );
  moveToSource.addChild(moveAlongPathBehavior(blackboard));
  moveToSource.addChild(lookAtItemBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.atTarget = true;
      b.pathFound = false;
      return true;
    })
  );

  const wateringBehavior = new BehaviorSequence(blackboard);
  wateringBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (!b.recreation.wateringAnimation) {
        const grid = b.agentData.grid;
        const plantTile = b.target;
        const plantPosition = grid.indexToWorld(plantTile.index);
        plantPosition.x += 64;
        plantPosition.y -= 32;
        b.recreation.wateringAnimation = new RotatingHoverItem(
          getSpritesheetAnimation("item", "watering_can"),
          plantPosition,
          0.5,
          -90,
          secondToTick(1.5)
        );
        ParticleSystem.addEmitter(b.recreation.wateringAnimation);
        const dropletDir = new Vector2(-1, 1).normalizeInPlace();
        const dropletOrigin = new Vector2(
          plantPosition.x - 16,
          plantPosition.y - 16
        );
        ParticleSystem.addEmitter(
          new ParticleEmitter(
            getSpritesheetAnimation("icon", "droplet"),
            dropletOrigin,
            {
              shape: EmissionShape.Cone,
              coneAngle: 25,
              coneDir: dropletDir,
              maxBurstCount: 10,
              burstRate: secondToTick(0.1),
              burstCapacity: 3,
              burstForce: 50,
              burstMinLifetime: secondToTick(0.5),
              burstMaxLifetime: secondToTick(1),
            }
          )
        );
      }
      return true;
    })
  );
  wateringBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (!b.recreation.wateringAnimation.playing) {
        b.recreation.wateringAnimation = null;
        b.recreation.wateringPlant = false;
        b.recreation.wateringTimer = 0;
        b.entropy.waterPlant.current = b.entropy.waterPlant.base;
        b.atTarget = false;
        return true;
      }
      return false;
    })
  );

  const leftSubTree = new BehaviorSequence(blackboard);
  leftSubTree.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.itemLookup = "plant";
      return true;
    })
  );
  leftSubTree.addChild(
    new BehaviorBranch(
      blackboard,
      new BehaviorCondition(blackboard, (b) => {
        return b.atTarget;
      }),
      wateringBehavior,
      moveToSource
    )
  );

  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      const filters = ["waterPlant", "none"];
      const isLocked = !filters.find((filter) => {
        return filter == b.lock;
      });
      return !isLocked;
    })
  );
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      b.recreation.wateringTimer += 1;
      return b.recreation.wateringTimer >= b.recreation.wateringCooldown;
    })
  );
  behavior.addChild(
    new BehaviorBranch(
      blackboard,
      new BehaviorCondition(blackboard, (b) => {
        return b.recreation.wateringPlant;
      }),
      leftSubTree,
      new BehaviorCondition(blackboard, (b) => {
        b.entropy.waterPlant.timer += 1;
        if (b.entropy.waterPlant.timer < b.entropy.waterPlant.cooldown) {
          return false;
        }

        b.entropy.waterPlant.timer = 0;
        const rng = Math.random();
        const threshold = b.entropy.waterPlant.current;
        if (rng >= 1 - threshold) {
          b.recreation.wateringPlant = true;
        } else {
          b.entropy.waterPlant.current = threshold / Math.sqrt(threshold);
        }
        return false;
      })
    )
  );

  return behavior;
};

export const idleBehavior = (blackboard) => {
  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      b.idle.timer += 1;
      if (b.idle.timer >= b.idle.rate) {
        return true;
      }
      return false;
    })
  );
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      if (!b.pathFound) {
        const grid = b.agentData.grid;
        const previousIndex = grid.coordToIndex(b.previousCoord);
        b.adjacentTiles = grid.adjacentTiles(b.agentData.currentCoord);
        b.adjacentTiles = b.adjacentTiles.filter((tile) => {
          return tile.walkable;
        });
        if (b.adjacentTiles.length === 1) {
          const tile = b.adjacentTiles.pop();
          b.pathFound = true;
          b.nextCoord = grid.indexToCoord(tile.index);
          const dir = b.nextCoord.sub(b.agentData.currentCoord).normalize();
          b.agentData.lookAt(dir);
        } else {
          while (!b.pathFound && b.adjacentTiles.length > 0) {
            const rand = Math.floor(Math.random() * b.adjacentTiles.length);
            const tile = b.adjacentTiles.splice(rand, 1)[0];
            if (tile.walkable && tile.index != previousIndex) {
              b.pathFound = true;
              b.nextCoord = grid.indexToCoord(tile.index);
              const dir = b.nextCoord.sub(b.agentData.currentCoord).normalize();
              b.agentData.lookAt(dir);
              break;
            }
          }
        }
      }

      return b.pathFound;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      const grid = b.agentData.grid;

      b.move.timer += 1;
      if (b.move.timer === b.move.rate) {
        b.move.timer = 0;
        grid.moveBuddy(b.agentData, b.nextCoord);
        b.previousCoord = b.agentData.currentCoord;
        b.agentData.currentCoord = b.nextCoord;
        b.lock = "none";
        return true;
      }
      const t = b.move.timer / b.move.rate;
      // FIXME: Could optimize this since they are constant across the movement
      const start = grid.coordToWorld(b.agentData.currentCoord);
      const end = grid.coordToWorld(b.nextCoord);

      const v = start.lerp(end, t);
      b.agentData.setPosition(new Vector2(v.x - grid.x, v.y - grid.y));
      b.lock = "idle";
      return false;
    })
  );
  behavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.idle.timer = 0;
      b.pathFound = false;
      return true;
    })
  );
  return behavior;
};
