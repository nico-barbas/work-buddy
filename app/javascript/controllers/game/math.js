export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  addXY(x, y) {
    return new Vector2(this.x + x, this.y + y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  floor() {
    return new Vector2(Math.floor(this.x), Math.floor(this.y));
  }

  isZero() {
    return this.x == 0 && this.y == 0;
  }

  lerp(b, t) {
    return new Vector2(this.x * (1 - t) + b.x * t, this.y * (1 - t) + b.y * t);
  }
}

export class Matrix2x2 {
  constructor() {
    this.a11 = 1;
    this.a12 = 0;
    this.a21 = 0;
    this.a22 = 1;
  }

  static from(a11, a12, a21, a22) {
    const m = new Matrix2x2();
    m.a11 = a11;
    m.a12 = a12;
    m.a21 = a21;
    m.a22 = a22;
    return m;
  }

  vectorMult(v) {
    return new Vector2(
      this.a11 * v.x + this.a12 * v.y,
      this.a21 * v.x + this.a22 * v.y
    );
  }

  inverse() {
    const invD = 1 / this.determinant();
    let m = new Matrix2x2();
    m.a11 = this.a22 * invD;
    m.a12 = -this.a12 * invD;
    m.a21 = -this.a21 * invD;
    m.a22 = this.a11 * invD;
    return m;
  }

  determinant() {
    return this.a11 * this.a22 - this.a12 * this.a21;
  }
}

export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  copy() {
    return new Vector3(this.x, this.y, this.z);
  }

  equal(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  scale(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  negate() {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  length() {
    return Math.sqrt(this.length2());
  }

  length2() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize() {
    const inverseLength = 1 / this.length();
    return new Vector3(
      this.x * inverseLength,
      this.y * inverseLength,
      this.z * inverseLength
    );
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    let result = new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
    return result;
  }
}

export class Rectangle {
  x;
  y;
  width;
  height;

  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  inBounds(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}
