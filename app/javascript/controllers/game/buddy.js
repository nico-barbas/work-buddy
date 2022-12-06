import { AnimatedSprite, Container } from "pixi.js";
import { getSpritesheetAnimation } from "./assets";
import {
  expressMoodBehavior,
  workBehavior,
  idleBehavior,
  feedBehavior,
  celebrateBehavior,
  drinkBehavior,
} from "./behaviors";
import { Vector2, Vector3 } from "./math";
import { SignalDispatcher } from "./signal";
import {
  AnimationSequence,
  InterpolationKind,
  secondToTick,
  Tween,
} from "./utils";
import {
  BehaviorTree,
  BehaviorResult,
  BehaviorSequence,
  BehaviorAction,
  BehaviorCondition,
} from "./behaviors";
import { MoodDisplay, NeedController } from "./needs";
import { OutlineFilter } from "pixi-filters";

export class Buddy extends Container {
  grid;
  sprite;
  currentCoord;
  timer = 0;
  rate = secondToTick(3);
  agent = new BehaviorTree();
  offset = new Vector2(62, 180);
  originPosition = new Vector2();
  animationOffset = new Vector2();
  needs = new NeedController();
  moodDisplay = new MoodDisplay(new Vector2(16, -38));

  constructor(app, grid) {
    super();
    this.grid = grid;
    this.sprite = new AnimatedSprite(
      getSpritesheetAnimation("character", "idle")
    );
    this.sprite.width *= this.grid.widthRatio;
    this.sprite.height *= this.grid.heightRatio;
    this.offset.x *= this.grid.widthRatio;
    this.offset.y *= this.grid.heightRatio;
    this.offset = this.offset.sub(this.grid.tileCenterOffset);
    this.addChild(this.sprite);
    this.addChild(this.moodDisplay);
    this.filters = [new OutlineFilter(1, 0x4c1f20, 25)];

    this.currentCoord = new Vector3(3, 0, 3);
    this.grid.addBuddy(this, this.currentCoord);

    this.animation = new AnimationSequence(2);
    this.animation.addAnimation(
      new Tween(secondToTick(0.3), 0, 32, InterpolationKind.InOut)
    );
    this.animation.addAnimation(
      new Tween(secondToTick(0.3), 32, 0, InterpolationKind.In)
    );
    {
      const blackboard = {
        lock: "none",
        agentData: this,
        runningNode: null,
        previousCoord: new Vector3(),
        nextCoord: new Vector3(),
        itemLookup: "",
        pathEmpty: false,
        pathFound: false,
        path: [],
        adjacentTiles: [],
        idle: {
          timer: 0,
          rate: secondToTick(3),
        },
        move: {
          timer: 0,
          rate: secondToTick(0.3),
        },
        work: {
          hasWork: false,
          atDesk: false,
        },
        mood: {
          timer: 0,
          rate: secondToTick(5),
          lowNeeds: [],
          selected: "",
        },
        food: {
          atFoodSource: false,
        },
        celebrate: {
          shouldCelebrate: false,
        },
      };

      this.agent.blackboard = blackboard;

      const breakSubTree = new BehaviorSequence(
        blackboard,
        BehaviorResult.Success
      );
      breakSubTree.addChild(feedBehavior(blackboard));
      breakSubTree.addChild(drinkBehavior(blackboard));
      breakSubTree.addChild(idleBehavior(blackboard));

      const root = new BehaviorSequence(blackboard, BehaviorResult.Success);
      root.addChild(celebrateBehavior(blackboard));
      root.addChild(expressMoodBehavior(blackboard));
      root.addChild(workBehavior(blackboard));
      root.addChild(breakSubTree);
      this.agent.setRoot(root);
    }

    this.setSignalListeners();

    const update = () => {
      this.agent.run();
      this.needs.update();
      this.moodDisplay.update();

      if (this.animation.playing) {
        const [offset, done] = this.animation.advance();

        this.animationOffset.y = offset;
        this.x = this.originPosition.x - this.animationOffset.x;
        this.y = this.originPosition.y - this.animationOffset.y;
      }
    };
    app.ticker.add(update);
  }

  setSignalListeners() {
    SignalDispatcher.addListener("interrupt.celebrate", () => {
      this.agent.blackboard.celebrate.shouldCelebrate = true;
      this.animation.play();
      this.agent.interrupt();
    });
    SignalDispatcher.addListener("interrupt.work", () => {
      this.agent.blackboard.work.hasWork = true;
      this.agent.interrupt();
    });
    SignalDispatcher.addListener("interrupt.break", () => {
      this.agent.blackboard.work.hasWork = false;
      this.agent.interrupt();
    });
  }

  setPosition(pos) {
    this.originPosition.x = pos.x - this.offset.x;
    this.originPosition.y = pos.y - this.offset.y;
    this.x = pos.x - this.offset.x - this.animationOffset.x;
    this.y = pos.y - this.offset.y - this.animationOffset.y;
  }

  lookAt(dir) {
    if (dir.x === 1 && dir.z === 0) {
      this.sprite.gotoAndStop(0);
    } else if (dir.x === 0 && dir.z === 1) {
      this.sprite.gotoAndStop(1);
    } else if (dir.x === -1 && dir.z === 0) {
      this.sprite.gotoAndStop(2);
    } else if (dir.x === 0 && dir.z === -1) {
      this.sprite.gotoAndStop(3);
    }
  }
}

class Personality {
  preferences = {};

  setPreferences(preferences) {
    this.preferences = preferences;
  }

  setPreferenceWeight(name, weight) {}
}
