import { GameObject } from "../engine/GameObject";
import { Collider } from "../engine/physics/collisions/Collider";
import { ICollidable } from "../engine/physics/collisions/types";
import { Rectangle } from "../engine/math/shapes/Rectangle";
import { AnimationRenderer } from "../engine/graphics/AnimationRenderer";
import { Atlas } from "../engine/graphics/Atlas";
import { GameTime } from "../engine/GameTime";

export class Brick extends GameObject implements ICollidable {
  collider: Collider<Rectangle>;
  ar: AnimationRenderer;
  mypos() {return this.transform.position;}
  constructor(x: number, y: number) {
    super('brick', {x: x, y: y});
    this.collider = new Collider(new Rectangle(x, y, 64, 16));
    this.components
    .add(this.ar = new AnimationRenderer());

  }

  awake() {
    super.awake();
    const atlas = this.services.get(Atlas);
    this.ar.anim = atlas.makeAnimation(10, ['bricks/1']);
  }

  update(gameTime: GameTime) {
    super.update(gameTime);

  }

  draw(gameTime: GameTime) {
    super.draw(gameTime);
    
  }
}