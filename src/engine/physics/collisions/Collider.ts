import { Shape } from "../../math/shapes/Shape";
import { Vector3 } from "../../math/Vector3";
import { Transform } from "../../Transform";
import { Rectangle } from "../../math/shapes/Rectangle";
import { Circle } from "../../math/shapes/Circle";

export class Collider<T extends Shape> {
  shape: T;
  private transform: Transform | undefined;
  /**
   * Pass in a class (e.g. Rectangle, Circle) to test this collider's shape
   * @param type 
   */
  shapeIs(type: new(...any: any[])=>Shape): boolean {
    return this.shape instanceof type;
  }

  setAnchor(x: number, y: number, z?: number) {
    this.shape.setAnchor(x, y, z);
    return this;
  }
  get anchor() {
    const pos = this.shape.anchor;
    return new Vector3 (pos.x, pos.y, pos.z);
  }
  set width(val: number) {
    const shape = this.shape;
    if (shape instanceof Rectangle) {
      shape.width = val;
    }
    if (shape instanceof Circle) {
      shape.radius = val/2;
    }
  }
  get width(): number {
    const shape = this.shape;
    if (shape instanceof Rectangle) {
      return shape.width;
    }
    if (shape instanceof Circle) {
      return shape.radius * 2;
    }
    return -1;
  }
  set height(val: number) {
    const shape = this.shape;
    if (shape instanceof Rectangle) {
      shape.height = val;
    }
    if (shape instanceof Circle) {
      shape.radius = val/2;
    }
  }
  get height(): number {
    const shape = this.shape;
    if (shape instanceof Rectangle) {
      return shape.height;
    }
    if (shape instanceof Circle) {
      return shape.radius * 2;
    }
    return -1;
  }
  set x(val: number) {
    this.shape.x = val;
  }
  get x(): number {
    return this.shape.x;
  }
  get y(): number {
    return this.shape.y;
  }
  set y(val: number) {
    this.shape.y = val;
  }
  get z(): number {
    return this.shape.z;
  }
  set z(val: number){
    this.shape.z = val;
  }

  /**
   * Manually sets the position of the collider. 
   * Will conflict if synced to a Transform. You should remove sync first if so.
   * @param x 
   * @param y 
   * @param z 
   */
  setPosition(x: number, y: number, z?: number) {
    const shape = this.shape;
    shape.x = x;
    shape.y = y;
    shape.z = z || shape.z;
  }
  /**
   * Gets the position of the collider
   */
  getPosition() {
    const shape = this.shape;
    return new Vector3(shape.x, shape.y, shape.z);
  }
  
  /**
   * Sync this collider's position to a Transform.
   * Behind the scenes, it subscribes to Transform's onPositionChanged event.
   * If there is already a transform synced to, it will automatically remove
   * that subscription and replace it with the new one.
   * @param transform 
   */
  syncToTransform(transform: Transform) {
    if (this.transform) {
      this.removeSyncToTransform();
    }
    let pos = transform.position;
    this.setPosition(pos.x, pos.y, pos.z);
    transform.onPositionChanged.subscribe(this.transformLinkHandler, this);
    this.transform = transform;
  }

  /**
   * Remove this collider's positional synchronization to a Transform.
   * @param transform 
   */
  removeSyncToTransform() {
    const transform = this.transform;
    if (transform) {
      transform.onPositionChanged.unsubscribe(this.transformLinkHandler);
    }   
  }
  
  constructor(shape: T) {
    this.shape = shape;
  }
  setAnchorExt(x: number, y:number, xPixels = 0, yPixels = 0) {
    this.shape.setAnchorExt(x, y, xPixels, yPixels);
    return this;
  } 

  private transformLinkHandler(pos: Vector3Like) {
    this.shape.setPosition(pos.x, pos.y, pos.z);
  }

  destroy() {
    this.removeSyncToTransform();
  }
}