import { Transform } from "./Transform";

export class Camera {
  transform: Transform;
  constructor(x = 0, y = 0, z = 0) {
    this.transform = new Transform(x, y, z);
  }
}