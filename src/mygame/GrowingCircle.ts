import { GameObject } from "../engine/gameobjects/GameObject";
import { ICollidable } from "../engine/physics/collisions/types";
import { Circle } from "../engine/math/shapes/Circle";
import { GraphicRenderer } from "../engine/graphics/GraphicRenderer";
import { Tweener } from "../engine/tweens/Tweener";
import { TweenFunctions } from "../engine/tweens/functions";
import { GameTime } from "../engine/GameTime";
import { Drawf } from "../engine/graphics/functions";
import { Mathf } from "../engine/math/functions";
import { Timer } from "../engine/timers/Timer";
import { Game2 } from "./Game2";
import { Collider } from "../engine/physics/collisions/Collider";
import { GameActor } from "../engine/gameobjects/GameActor";


export class GrowingCircle extends GameActor<Circle> {
    constructor(
        x: number, y: number,
        private radius: number,
        public r: number, public g: number, public b: number) {
        super(new Circle(x, y, radius), 'growCirc');
    }

    create() {
        super.create();
        this.transform.onPositionChanged.subscribe((pos) => {
            this.collider.setPosition(pos.x, pos.y, pos.z);
        });
        const tweener = this.services.get(Tweener);
        const gr = this.image;
        const time = 4;
        tweener.tweenTo(gr.scale, ['x'], [60 + Game2.colorRange.r], time, Mathf.choose(TweenFunctions.easeInCubic))
            .setRepeat(0);
        tweener.tweenTo(this, ['r'], [this.r  - Game2.colorRange.r], time, TweenFunctions.easeInOutCubic);
        tweener.tweenTo(this, ['g'], [this.g  + Game2.colorRange.g], time, TweenFunctions.easeInOutCubic);
        tweener.tweenTo(this, ['b'], [this.b  - Game2.colorRange.b], time, TweenFunctions.easeInOutCubic);
        tweener.tweenTo(gr.scale, ['y'], [60 + Game2.colorRange.g], time, Mathf.choose(TweenFunctions.easeInCubic))
            .setRepeat(0)
            .onFinish(() => {
                this.destroy(); return;
                tweener.tweenTo(gr, ['alpha'], [0], 1, Mathf.choose(TweenFunctions.easeInCubic, TweenFunctions.easeInCirc, TweenFunctions.easeInOutQuad, TweenFunctions.easeInOutQuint))
                    .onFinish(() => {
                        this.destroy();
                    });
            });
    }

    update(gameTime: GameTime) {
        let pos = this.transform.getPosition(true);
        let x = Mathf.lengthDirX(Game2.direction, 2);
        let y = Mathf.lengthDirY(Game2.direction, 2);
        this.transform.setPosition(pos.x + x, pos.y + y, pos.z);
        super.update(gameTime);
    }

    draw(gameTime: GameTime) {
        let gr = this.components.get(GraphicRenderer);
        gr.start();
        //this.canvas.context.fillStyle = Drawf.rgb(this.r, this.g, this.b);
        Drawf.circle(this.canvas.guiCtx, Drawf.rgb(this.r, this.g, this.b), -this.collider.anchor.x, -this.collider.anchor.y, this.radius);
        gr.end();
        super.draw(gameTime);

    }

    destroy() {
        // Remove cached references

        super.destroy();
    }
}