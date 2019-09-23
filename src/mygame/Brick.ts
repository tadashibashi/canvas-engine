import { Rectangle } from "../engine/math/shapes/Rectangle";
import { Atlas } from "../engine/graphics/Atlas";
import { GameTime } from "../engine/GameTime";
import { GameActor } from "../engine/gameobjects/GameActor";
import { AnimationManager } from "../engine/graphics/AnimationManager";

export class Brick extends GameActor<Rectangle> {
  mypos() {return this.transform.position;}
  constructor(x: number, y: number) {
    super(new Rectangle(x, y, 64, 16), 'brick');
  }

  create() {
    const anims = this.services.get(AnimationManager);
    this.image.anim = anims.get('brick');

    super.create();
  }

  update(gameTime: GameTime) {
    super.update(gameTime);

  }

  draw(gameTime: GameTime) {
    super.draw(gameTime);   
  }
}