import { Vector2 } from "./math";

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

export const expressMoodBehavior = (blackboard) => {
  const happyMoods = ["happy", "sing", "daydream"];
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
    new BehaviorCondition(blackboard, (b) => {
      if (!b.pathFound) {
        const grid = b.agentData.grid;
        const deskTile = grid.findItem("desk");
        const deskCoord = grid.indexToCoord(deskTile.index);
        if (deskTile) {
          const sitCoord = deskCoord.add(
            deskTile.content.rotationIndexToDirectionVector()
          );
          [b.path, b.pathFound] = grid.pathTo(
            b.agentData.currentCoord,
            sitCoord,
            {
              includeStart: false,
              includeEnd: true,
            }
          );
          b.nextCoord = grid.indexToCoord(b.path.pop().index);
        }
      }
      return b.pathFound;
    })
  );
  moveToDeskBehavior.addChild(
    new BehaviorAction(blackboard, (b) => {
      const grid = b.agentData.grid;

      b.move.timer += 1;
      if (b.move.timer === b.move.rate) {
        b.move.timer = 0;
        grid.moveBuddy(b.agentData, b.nextCoord);
        b.previousCoord = b.agentData.currentCoord;
        b.agentData.currentCoord = b.nextCoord;
        b.lock = "none";
        if (b.path.length > 0) {
          b.nextCoord = grid.indexToCoord(b.path.pop().index);
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
      b.lock = "work";
      return false;
    })
  );
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
      const tile = grid.findItem(b.itemLookup);
      const coord = grid.indexToCoord(tile.index);
      if (tile) {
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
        b.nextCoord = grid.indexToCoord(b.path.pop().index);
      }
    }
    return b.pathFound;
  });
};

const moveAlongPathBehavior = (blackboard) => {
  return new BehaviorAction(blackboard, (b) => {
    const grid = b.agentData.grid;

    b.move.timer += 1;
    if (b.move.timer === b.move.rate) {
      b.move.timer = 0;
      grid.moveBuddy(b.agentData, b.nextCoord);
      b.previousCoord = b.agentData.currentCoord;
      b.agentData.currentCoord = b.nextCoord;
      if (b.path.length > 0) {
        b.nextCoord = grid.indexToCoord(b.path.pop().index);
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

export const feedBehavior = (blackboard) => {
  const moveToSource = new BehaviorSequence(blackboard);
  moveToSource.addChild(findPathBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      if (b.move.timer + 1 === b.move.rate) {
        b.lock = "none";
      } else {
        b.lock = "feed";
      }
      return true;
    })
  );
  moveToSource.addChild(moveAlongPathBehavior(blackboard));
  moveToSource.addChild(
    new BehaviorAction(blackboard, (b) => {
      b.food.atFoodSource = true;
      b.pathFound = false;
      b.agentData.moodDisplay.play("eat");
      return true;
    })
  );

  const behavior = new BehaviorSequence(blackboard);
  behavior.addChild(
    new BehaviorCondition(blackboard, (b) => {
      const ok = b.agentData.needs.isLow("hunger");
      if (ok) {
        b.itemLookup = "fridge";
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
          b.agentData.needs.increaseValue("hunger", 65);
        }
        return done;
      }),
      moveToSource
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
        while (!b.pathFound && b.adjacentTiles.length > 0) {
          const rand = Math.floor(Math.random() * b.adjacentTiles.length);
          const tile = b.adjacentTiles.splice(rand, 1)[0];
          if (tile.walkable && tile.index != previousIndex) {
            b.pathFound = true;
            b.nextCoord = grid.indexToCoord(tile.index);
            break;
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
