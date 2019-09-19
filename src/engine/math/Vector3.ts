import { Vector2 } from "./Vector2";

export class Vector3 {
  x: number;
  y: number;
  z: number;
  
  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  add(x: number, y: number, z: number): void;
  add(vector2: Vector2): void;
  add(vector3: Vector3): void;
  add(vector: Vector2 | Vector3 | number, y?: number, z?: number): void {
    if (typeof vector === 'object') {
      this.x += vector.x;
      this.y += vector.y;
      if (vector instanceof Vector3) {
        this.z += vector.z;
      }
    } else {
      this.x += vector;
      this.y += y || 0;
      this.z += z || 0;
    }
  }

  multiply(x: number, y: number, z: number): void;
  multiply(vector2: Vector2): void;
  multiply(vector3: Vector3): void;
  multiply(vector: Vector2 | Vector3 | number, y?: number, z?: number): void {
    if (typeof vector === 'object') {
      this.x *= vector.x;
      this.y *= vector.y;
      if (vector instanceof Vector3) {
        this.z *= vector.z;
      }
    } else {
      this.x *= vector;
      this.y *= y || 1;
      this.z *= z || 1;
    }
  }

  divide(x: number, y: number, z: number): void;
  divide(vector2: Vector2): void;
  divide(vector3: Vector3): void;
  divide(vector: Vector2 | Vector3 | number, y?: number, z?: number): void {
    if (typeof vector === 'object') {
      this.x /= vector.x;
      this.y /= vector.y;
      if (vector instanceof Vector3) {
        this.z /= vector.z;
      }
    } else {
      this.x /= vector;
      this.y /= y || 1;
      this.z /= z || 1;
    }
  }

  set(vector3: Vector3): void;
  set(x: number, y?: number, z?: number): void;
  set(x: number | Vector3, y?: number, z?: number): void {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z
    } else {
      this.x = x;
      this.y = y || this.y;
      this.z = z || this.z;
    }
  }

  /**
   * Checks if this Vector3 is equal to another vector
   * @param vector The vector to compare. If Vector2 type, it will only check x and y comparisons to determine equality.
   */
  isEqualTo(vector: Vector2 | Vector3): boolean {
    if (vector instanceof Vector3) {
      return (
        this.x === vector.x &&
        this.y === vector.y &&
        this.z === vector.z
      );
    } else {
      return (
        this.x === vector.x &&
        this.y === vector.y
      );
    }
  }
}