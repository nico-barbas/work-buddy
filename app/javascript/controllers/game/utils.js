export const Direction = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
};

// FIXME: Use the app FPS instead
export const secondToTick = (sec) => {
  return sec * 60;
};

export const InterpolationKind = {
  Linear: 0,
  InOut: 1,
  In: 2,
};

export class Tween {
  interpolationKind = InterpolationKind.Linear;
  timer = 0;
  min = 0;
  max = 0;

  constructor(time, min, max, interpolationKind = InterpolationKind.Linear) {
    this.interpolationKind = interpolationKind;
    this.time = time;
    this.min = min;
    this.max = max;
  }

  tween() {
    let done = false;
    this.timer += 1;
    if (this.timer >= this.time) {
      this.timer = 0;
      done = true;
    }

    let t = this.timer / this.time;
    let result = 0;
    switch (this.interpolationKind) {
      case InterpolationKind.Linear:
        break;
      case InterpolationKind.InOut:
        const v1 = t * t;
        const v2 = 1 - (1 - t) * (1 - t);
        t = this.lerp(v1, v2, t);
        break;
      case InterpolationKind.In:
        t = t * t;
    }

    result = this.lerp(this.min, this.max, t);
    return [result, done];
  }

  reset() {
    this.timer = 0;
  }

  lerp(v1, v2, t) {
    return v1 * (1 - t) + v2 * t;
  }
}

export class AnimationSequence {
  animations = [];
  current;
  currentIndex = 0;
  playing = false;
  repeat = 1;
  currentIteration = 0;

  constructor(repeat = 1) {
    this.repeat = repeat;
  }

  play() {
    this.playing = true;
    this.currentIndex = 0;
    this.currentIteration = 0;
    this.animations.forEach((animation) => {
      animation.reset();
    });
    this.current = this.animations[0];
  }

  resetIteration() {
    this.playing = true;
    this.currentIndex = 0;
    this.animations.forEach((animation) => {
      animation.reset();
    });
    this.current = this.animations[0];
  }

  advance() {
    if (this.animations.length == 0) {
      return [0, false];
    }

    let [result, done] = this.current.tween();
    if (done) {
      this.currentIndex += 1;
      if (this.currentIndex >= this.animations.length) {
        this.currentIteration += 1;
        if (this.currentIteration >= this.repeat) {
          this.playing = false;
          return [this.animations[0].min, true];
        } else {
          this.resetIteration();
          return this.advance();
        }
      } else {
        this.current = this.animations[this.currentIndex];
        return this.advance();
      }
    }
    return [result, done];
  }

  addAnimation(animation) {
    this.animations.push(animation);
  }
}
