import { AnimatedSprite, Container } from "pixi.js";
import { getSpritesheetAnimations } from "./assets";
import { secondToTick, Tween } from "./utils";

export class Need {
  max = 0;
  current = 0;
  shouldDecrease = true;
  decreaseRate = 0;
  decreaseTimer = 0;
  affectMood = true;
  moodWeight = 1;

  constructor(max) {
    this.max = max;
    this.current = max;
  }

  withDecrease(rate) {
    this.shouldDecrease = true;
    this.decreaseRate = rate;
    this.decreaseTimer = 0;
    return this;
  }

  withMoodWeight(weight) {
    this.affectMood = true;
    this.moodWeight = weight;
    return this;
  }

  set(value) {
    this.current = Math.max(Math.min(value, this.max), 0);
  }

  increase(amount) {
    this.current = Math.min(this.current + amount, this.max);
  }

  decrease(amount) {
    this.current = Math.max(this.current - amount, 0);
  }

  update() {
    if (this.shouldDecrease) {
      this.decreaseTimer += 1;
      if (this.decreaseTimer >= this.decreaseRate) {
        this.decreaseTimer = 0;
        this.decrease(1);
      }
    }
  }
}

export class NeedController {
  needs = {};
  mood = new Need(100);
  lowThreshold = 35;

  constructor() {
    this.needs = {
      hunger: new Need(100).withDecrease(secondToTick(120)).withMoodWeight(3),
      thirst: new Need(100).withDecrease(secondToTick(60)).withMoodWeight(4),
      bathroom: new Need(100).withDecrease(secondToTick(60)).withMoodWeight(6),
      rest: new Need(100).withDecrease(secondToTick(180)).withMoodWeight(2),
      recreation: new Need(100)
        .withDecrease(secondToTick(85))
        .withMoodWeight(1),
    };

    this.needs.hunger.set(20);
  }

  update() {
    let moodTotal = 0;
    let moodDenom = 0;
    Object.values(this.needs).forEach((need) => {
      need.update();
      if (need.affectMood) {
        moodTotal += need.current * need.moodWeight;
        moodDenom += need.moodWeight;
      }
    });

    this.mood.set(moodTotal / moodDenom);
  }

  lowNeeds() {
    const result = [];
    Object.entries(this.needs).forEach((entry) => {
      const [name, need] = entry;
      if (need.current <= this.lowThreshold) {
        result.push(name);
      }
    });

    return result;
  }

  getValue(name) {
    return this.needs[name].current;
  }

  increaseValue(name, amount) {
    if (name in this.needs) {
      this.needs[name].increase(amount);
    }
  }

  isLow(name) {
    return this.needs[name].current <= this.lowThreshold;
  }
}

export class MoodDisplay extends Container {
  timer = 0;
  duration = secondToTick(3);
  playing = false;
  sprites = {};
  current = null;
  moodMap = {
    hunger: ["cloud", "bars", "faceAngry"],
    thirst: ["cloud", "bars", "faceAngry"],
    bathroom: ["cloud", "bars", "faceAngry"],
    rest: ["cloud", "bars", "faceAngry", "sleep", "sleeps"],
    recreation: ["cloud", "bars", "faceSad"],
    happy: ["faceHappy", "laugh", "star"],
    sing: ["music"],
    daydream: ["faceHappy", "laugh", "star"],
    eat: ["faceRelieved"],
  };

  constructor(offset) {
    super();
    Object.entries(getSpritesheetAnimations("icon")).forEach((entry) => {
      const [name, animation] = entry;
      const moodName = name.replace(/emote_/, "");
      this.sprites[moodName] = new AnimatedSprite(animation);
    });

    this.x += offset.x;
    this.y += offset.y;
    this.bubbleTween = new Tween(this.duration / 4, 0, 0.5);
    this.bubbleDirection = -1;
  }

  update() {
    if (!this.playing) {
      return;
    }
    this.timer += 1;
    if (this.timer >= this.duration) {
      this.timer = 0;
      this.playing = false;
      this.current.y = 0;
      this.removeChildren();
    } else {
      const [yOffset, done] = this.bubbleTween.tween();
      if (done) {
        this.bubbleDirection *= -1;
      }

      this.current.y += yOffset * this.bubbleDirection;
    }
  }

  play(name) {
    if (name in this.moodMap) {
      const moods = this.moodMap[name];
      const moodName = moods[Math.floor(Math.random() * moods.length)];

      this.removeChildren();
      this.current = this.sprites[moodName];
      this.current.y = 0;
      this.addChild(this.current);
      this.timer = 0;
      this.playing = true;
      this.bubbleDirection = -1;
      this.bubbleTween.reset();
    }
  }
}
