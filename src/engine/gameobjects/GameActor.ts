import { GameObject } from "./GameObject";
import { Transform } from "../Transform";
import { AnimationRenderer } from "../graphics/AnimationRenderer";
import { Collider } from "../physics/collisions/Collider";
import { Shape } from "../math/shapes/Shape";
import { Drawf } from "../graphics/renderers/functions";
import { Rectangle } from "../math/shapes/Rectangle";
import { Circle } from "../math/shapes/Circle";
import { GameTime } from "../GameTime";

export class GameActor<T extends Shape> extends GameObject {
  transform: Transform;
  image: AnimationRenderer;
  collider: Collider<T>;
  showCollider = true;
  constructor(shape: T, tag?: string) {
    super(tag);
    this.components
      .add(this.transform = new Transform(shape.x, shape.y))
      .add(this.image = new AnimationRenderer());

    this.collider = new Collider<T>(shape);
    this.collider.syncToTransform(this.transform);
  }

  draw(gameTime: GameTime) {
    super.draw(gameTime);
    if (this.showCollider) {
      if (this.collider.shapeIs(Rectangle)) {
        Drawf.rectangle(this.canvas.pixelCtx, Drawf.rgba(255, 0, 255, .5), this.collider.left, this.collider.top, this.collider.width, this.collider.height);
      }
      if (this.collider.shapeIs(Circle)) {
        Drawf.circle(this.canvas.pixelCtx, Drawf.rgba(255, 0, 255, .5), this.collider.x - this.collider.anchor.x, this.collider.y - this.collider.anchor.y, this.collider.width/2);
      }
    }
  }
}