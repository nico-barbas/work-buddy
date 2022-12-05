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
