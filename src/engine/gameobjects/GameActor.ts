import { GameObject } from "./GameObject";
import { Transform } from "../Transform";
import { AnimationRenderer } from "../graphics";
import { Collider } from "../physics/collisions/Collider";
import { Shape } from "../math/shapes/Shape";

export class GameActor<T extends Shape> extends GameObject {
  transform: Transform;
  image: AnimationRenderer;
  collider: Collider<T>;

  constructor(shape: T, tag?: string) {
    super(tag);
    this.components
      .add(this.transform = new Transform(shape.x, shape.y))
      .add(this.image = new AnimationRenderer());

    this.collider = new Collider<T>(shape);
    this.collider.syncToTransform(this.transform);
  }
}