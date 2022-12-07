import { OutlineFilter } from "pixi-filters";
import { AnimatedSprite, Container, ParticleContainer } from "pixi.js";
import { Matrix2x2, degreesToRadians, Vector2 } from "./math";
import { InterpolationKind, Tween } from "./utils";

export class ParticleSystem extends Container {
  static instance;
  emitters = [];

  constructor(app) {
    super();
    app.ticker.add(() => {
      if (this.emitters.length > 0) {
        const toRemove = [];
        for (let i = 0; i < this.emitters.length; i += 1) {
          const emitter = this.emitters[i];
          const done = emitter.update();
          if (done) {
            toRemove.push(i);
          }
        }

        if (toRemove.length > 0) {
          toRemove.sort().forEach((index) => {
            this.removeChild(this.emitters[index]);
            this.emitters.splice(index, 1);
          });
        }
      }
    });
  }

  static init(app) {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem(app);
      app.stage.addChild(ParticleSystem.instance);
    }
  }

  static addEmitter(emitter) {
    const instance = ParticleSystem.instance;
    instance.emitters.push(emitter);
    instance.addChild(emitter);
    emitter.playing = true;
  }
}

export const EmissionShape = {
  Cone: 0,
  Circle: 1,
};

export class ParticleEmitter extends ParticleContainer {
  particles = [];
  burstTimer = 0;
  burstCount = 0;
  lifetimeTimers = [];

  constructor(spritesheet, position, options) {
    super();
    this.x = position.x;
    this.y = position.y;
    this.spritesheet = spritesheet;
    this.options = options;
    this.burstTimer = this.options.burstRate;

    switch (this.options.shape) {
      case EmissionShape.Cone:
        this.matCache = [];
        for (let o = 0; o < this.options.coneAngle; o += 1) {
          const angleRadian = degreesToRadians(o);
          this.matCache.push(Matrix2x2.rotation(angleRadian));
        }
        break;
      default:
        console.error("Emitter shape not supported");
        break;
    }
  }

  update() {
    if (!this.playing) {
      return false;
    }

    this.burstTimer += 1;
    if (this.burstTimer >= this.options.burstRate) {
      this.burstTimer = 0;
      this.burstCount += 1;

      switch (this.options.shape) {
        case EmissionShape.Cone:
          this.emitCone();
          break;
        default:
          console.error("Emitter shape not supported");
          break;
      }
      this.lifetimeTimers.push(0);
    }

    const dt = 1 / 60;
    const dGravity = Vector2.DOWN.scale(dt);
    this.particles.forEach((particle) => {
      particle.lifetime += 1;
      if (particle.lifetime >= particle.maxLifetime) {
        particle.sprite.visible = false;
      } else {
        particle.dir.scaleInPlace(dt * this.options.burstForce);
        particle.dir.addInPlace(dGravity);
        particle.sprite.x += particle.dir.x;
        particle.sprite.y += particle.dir.y;
        particle.dir.normalizeInPlace();
      }
    });

    let burstsDone = false;
    for (let i = 0; i < this.burstCount; i += 1) {
      this.lifetimeTimers[i] += 1;
      burstsDone =
        burstsDone || this.lifetimeTimers[i] >= this.options.burstMaxLifetime;
    }

    this.playing = !burstsDone || this.burstCount < this.options.maxBurstCount;
    return !this.playing;
  }

  emitCone() {
    for (let i = 0; i < this.options.burstCapacity; i += 1) {
      const randAngle = Math.floor(Math.random() * this.matCache.length);
      const mat = this.matCache[randAngle];
      const dir = mat.vectorMult(this.options.coneDir);

      if (Math.random() >= 0.5) {
        const coneDir = this.options.coneDir;
        dir.inverseInPlace().reflectInPlace(coneDir);
      }

      const minLifetime = this.options.burstMinLifetime;
      const maxLifetime = Math.floor(
        Math.random() * (this.options.burstMaxLifetime - minLifetime)
      );
      const particle = {
        lifetime: 0,
        maxLifetime: minLifetime + maxLifetime,
        dir: dir,
        sprite: new AnimatedSprite(this.spritesheet),
      };
      this.addChild(particle.sprite);
      this.particles.push(particle);
    }
  }
}

export class RotatingHoverItem extends Container {
  playing = false;

  constructor(spritesheet, position, scale, rotation, duration) {
    super();
    this.spritesheet = spritesheet;
    this.x = position.x;
    this.y = position.y;
    this.rotationValue = degreesToRadians(rotation);
    this.tween = new Tween(
      duration,
      0,
      this.rotationValue,
      InterpolationKind.In
    );
    this.duration = duration;
    this.sprite = new AnimatedSprite(spritesheet);
    this.sprite.width *= scale;
    this.sprite.height *= scale;
    this.addChild(this.sprite);
    this.filters = [new OutlineFilter(1, 0x4c1f20, 0.25)];
  }

  update() {
    const [rotation, done] = this.tween.tween();
    if (!done) {
      this.sprite.rotation = rotation;
    }
    this.playing = !done;
    return done;
  }
}
