import { GameObject } from "../engine/GameObject";
import { ICollidable } from "../engine/physics/collisions/types";
import { Circle } from "../engine/math/shapes/Circle";
import { GraphicRenderer } from "../engine/graphics/GraphicRenderer";
import { Tweener } from "../engine/tweens/Tweener";
import { TweenFunctions } from "../engine/tweens/functions";
import { GameTime } from "../engine/GameTime";
import { Drawf } from "../engine/graphics/functions";


export class Ball extends GameObject implements ICollidable {
    // cache components here
    readonly collider: Circle;

    constructor(
        x: number, y: number,
        private radius: number,
        private color: string) {
        super('ball', { x: x, y: y });

        this.components.add(new GraphicRenderer());
        this.collider = new Circle(x, y, radius);


    }

    awake() {
        super.awake();
        this.transform.onChangePosition.subscribe(this, (pos) => {
            this.collider.setPosition(pos.x, pos.y, pos.z);
        });
        const tweener = this.services.get(Tweener);
        const gr = this.components.get(GraphicRenderer);
        tweener.tweenTo(gr.scale, 'x', 100, 5, TweenFunctions.easeInCubic)
            .setRepeat(0);
        tweener.tweenTo(gr.scale, 'y', 100, 5, TweenFunctions.easeInCubic)
            .setRepeat(0)
            .onFinish(() => {
                tweener.tweenTo(gr, 'alpha', 0, 1, TweenFunctions.easeOutCirc)
                    .onFinish(() => {
                        this.destroy();
                    });
            });
    }

    update(gameTime: GameTime) {
        let pos = this.transform.getPosition(true);
        this.transform.setPosition(pos.x, pos.y + 1, pos.z);
        if (this.transform.position.y > this.canvas.virtualHeight + this.radius) {
            console.log('I got destroyed! Objects left in manager: ' + this.manager.length);
            this.destroy();
            
            
        }
        super.update(gameTime);
    }

    draw(gameTime: GameTime) {
        let gr = this.components.get(GraphicRenderer);
        gr.start();
        this.canvas.context.fillStyle = this.color;
        Drawf.circle(this.canvas.context, this.color, -this.collider.anchor.x, -this.collider.anchor.y, this.radius);
        gr.end();
        super.draw(gameTime);

    }

    destroy() {
        // Remove cached references

        super.destroy();
    }
}