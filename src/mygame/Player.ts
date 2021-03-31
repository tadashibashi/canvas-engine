import { Rectangle } from "../engine/math/shapes/Rectangle";
import { GameTime } from "../engine/GameTime";
import { InputManager } from "../engine/input/InputManager";
import { Mathf } from "../engine/math/functions";
import { Ball } from "./Ball";
import { GameActor } from "../engine/gameobjects/GameActor";
import { AnimationManager } from "../engine/graphics/AnimationManager";

export class Player extends GameActor<Rectangle> {
	// cache components here

    get balls(): Ball[] {
        return this._balls as Ball[];
    }
    private _balls: Ball[] | undefined;

	constructor(
		x: number, y: number, 
		private width: number, 
		private height: number
		) {
        super(new Rectangle(x, y, width, height), 'brick');
		this.collider.setAnchorExt(.5, 1); 
	}

	create() {
        this.collider.syncToTransform(this.transform);
		this._balls = this.manager.getByTag('ball');
		const image = this.image;
		const anims = this.services.get(AnimationManager);
		this.drawOrder = 10;
		image.anim = anims.get('brick');
		image.setAnchor(this.width/2, this.height);
        //console.log(this.balls);
		//this._audioTrack = this.services.get(AssetBank).audio.get('music');
		//this.audioTrack.play().catch((reason) => console.log(reason));
		// Connection logic here
		super.create();
	}

	update(gameTime: GameTime) {
		const pos = this.transform.getPosition(true);
		const input = this.scene.input;
        this.transform.setPosition(Mathf.clamp(input.pointer.position.x, this.width * .5, this.canvas.virtualWidth - this.width * .5), pos.y);
        
        //this.balls.forEach((ball) => {
        //    if (!Object.is(this, ball)) {
        //        Collisionf.checkAgainstCollideables(this, null, [ball], (other) => {
        //            console.log('Yargh matey');
        //            console.log(this.balls.length);
        //        });
        //    }
        //});
		super.update(gameTime);		
		// Update logic here	
	}

	draw(gameTime: GameTime) {
		super.draw(gameTime);
	}

	destroy() {
		// Remove cached references
		super.destroy();
	}
}