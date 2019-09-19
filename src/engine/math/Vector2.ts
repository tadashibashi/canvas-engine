export class Vector2 {
  x: number;
  y: number;
  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }

  static get Zero(): Vector2 {
    return new Vector2(0, 0);
  }
  static get Right(): Vector2 {
    return new Vector2(1, 0);
  }
  static get Left(): Vector2 {
    return new Vector2(-1, 0);
  }
  static get Up(): Vector2 {
    return new Vector2(0, -1);
  }
  static get Down(): Vector2 {
    return new Vector2(0, 1);
  }

  set(vector2: Vector2): void;
  set(x: number, y: number): void;
  set(x: number | Vector2, y?: number): void {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y || this.y;
    }
  }

  multiply(x: number, y: number): void;
  multiply(vector2: Vector2Like): void;
  multiply(vector3: Vector3Like): void;
  multiply(vector: Vector2Like | Vector3Like | number, y?: number) {
    if (typeof vector === 'object') {
      this.x *= vector.x;
      this.y *= vector.y;
    } else {
      this.x *= vector;
      this.y *= y || 1;
    }
  }

  add(x: number, y: number): void;
  add(vector2: Vector2Like): void;
  add(vector3: Vector3Like): void;
  add(vector: Vector2Like | Vector3Like | number, y?: number) {
    if (typeof vector === 'object') {
      this.x += vector.x;
      this.y += vector.y;
    } else {
      this.x += vector;
      this.y += y || 1;
    }
  }

  divide(x: number, y: number): void;
  divide(vector2: Vector2Like): void;
  divide(vector3: Vector3Like): void;
  divide(vector: Vector2Like | Vector3Like | number, y?: number) {
    if (typeof vector === 'object') {
      this.x /= vector.x;
      this.y /= vector.y;
    } else {
      this.x /= vector;
      this.y /= y || 1;
    }
  }

  isEqualTo(vector2: Vector2Like): boolean {
    return (vector2.x === this.x && vector2.y === this.y);
  }
}

