import { GameObject } from "../engine/GameObject";
import { ICollidable } from "../engine/physics/collisions/types";
import { Rectangle } from "../engine/math/shapes/Rectangle";
import { GrowingCircle } from "./GrowingCircle";
import { GraphicRenderer } from "../engine/graphics/GraphicRenderer";
import { AssetBank } from "../engine/assets/AssetBank";
import { GameTime } from "../engine/GameTime";
import { InputManager } from "../engine/input/InputManager";
import { Mathf } from "../engine/math/functions";
import { Collider } from "../engine/physics/collisions/Collider";
import { Ball } from "./Ball";

export class Player extends GameObject implements ICollidable {
	// cache components here
	get audioTrack(): HTMLAudioElement {
		return this._audioTrack as HTMLAudioElement;
	}
    private _audioTrack: HTMLAudioElement | undefined;
    readonly collider: Collider<Rectangle>;
    get balls(): Ball[] {
        return this._balls as Ball[];
    }
    private _balls: Ball[] | undefined;

	constructor(
		x: number, y: number, 
		private color: string, 
		private width: number, 
		private height: number
		) {
        super('player', { x: x, y: y });
 
        this.components.add(new GraphicRenderer());
		this.collider = new Collider(new Rectangle(x, y, width, height));
		this.collider.setAnchorExt(.5, 1); 
	}

	awake() {
        super.awake();
        this.collider.syncToTransform(this.transform);
        this._balls = this.manager.getByTag('ball');
        //console.log(this.balls);
		this._audioTrack = this.services.get(AssetBank).audio.get('music');
		//this.audioTrack.play().catch((reason) => console.log(reason));
		// Connection logic here
	}

	update(gameTime: GameTime) {
		const pos = this.transform.getPosition(true);
		const input = this.services.get(InputManager);
		
        this.transform.setPosition(Mathf.clamp(input.pointer.position.x, this.width * .5, this.canvas.virtualWidth - this.width * .5), pos.y);
        
		if (pos.x > this.canvas.virtualWidth) {
			if (this._audioTrack) this._audioTrack.pause();
        }
        
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
		let gr = this.components.get(GraphicRenderer);
		gr.start();
		this.canvas.guiCtx.fillStyle = this.color;
		this.canvas.guiCtx.fillRect(-this.collider.anchor.x, -this.collider.anchor.y, this.width, this.height);
		gr.end();
		super.draw(gameTime);
	}

	destroy() {
		// Remove cached references
		super.destroy();
	}
}