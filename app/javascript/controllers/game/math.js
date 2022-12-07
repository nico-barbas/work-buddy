export class Vector2 {
  static DOWN = new Vector2(0, 1);

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  addInPlace(v) {
    this.x += v.x;
    this.y += v.y;
  }

  addXY(x, y) {
    return new Vector2(this.x + x, this.y + y);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  scale(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  scaleInPlace(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // FIXME: No Division by 0 check
  normalizeInPlace() {
    const inverseLength = 1 / this.length();
    this.x *= inverseLength;
    this.y *= inverseLength;
    return this;
  }

  floor() {
    return new Vector2(Math.floor(this.x), Math.floor(this.y));
  }

  inverseInPlace() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  isZero() {
    return this.x == 0 && this.y == 0;
  }

  lerp(b, t) {
    return new Vector2(this.x * (1 - t) + b.x * t, this.y * (1 - t) + b.y * t);
  }

  reflect(normal) {
    const dot = this.dot(normal);
    return new Vector2(
      this.x - 2 * normal.x * dot,
      this.y - 2 * normal.y * dot
    );
  }

  reflectInPlace(normal) {
    const dot = normal.dot(this);
    this.x = this.x - 2 * normal.x * dot;
    this.y = this.y - 2 * normal.y * dot;
    return this;
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

  static rotation(angleRadian) {
    const m = new Matrix2x2();
    const c = Math.cos(angleRadian);
    const s = Math.sin(angleRadian);
    m.a11 = c;
    m.a12 = s;
    m.a21 = -s;
    m.a22 = c;
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

  negateInPlace() {
    this.a11 *= -1;
    this.a12 *= -1;
    this.a21 *= -1;
    this.a22 *= -1;
    return this;
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

export const degreesToRadians = (angleDegree) => {
  return angleDegree * (Math.PI / 180);
};
