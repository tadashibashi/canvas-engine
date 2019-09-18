import { GameObject } from '../components/gameobjects/GameObject';
import { GameTime } from '../core/GameTime';
import { GraphicRenderer } from '../components/graphics/GraphicRenderer';
import { AssetManager } from '../core/AssetManager';
import { ICollidable } from '../core/Interfaces';
import { Rectangle } from '../core/shapes/Rectangle';
import { Collisionf } from '../components/colliders/CollisionFunctions';
import { Ball } from './Ball';

export class Player extends GameObject implements ICollidable {
	// cache components here
	get audioTrack(): HTMLAudioElement {
		return this._audioTrack as HTMLAudioElement;
	}
    private _audioTrack: HTMLAudioElement | undefined;
    readonly collider: Rectangle;
    get balls(): Ball[] {
        return this._balls as Ball[];
    }
    private _balls: Ball[] | undefined;


	constructor(
		x: number, y: number, 
		private color: string, 
		private width: number, 
        private height: number) {
        super('player', { x: x, y: y });
 
        this.components.add(new GraphicRenderer());
        this.collider = new Rectangle(x, y, width, height);

        
	}

	awake() {
        super.awake();
        this.transform.onChangePosition.subscribe(this, (pos) => {
            this.collider.setPosition(pos.x, pos.y, pos.z);
        });
        this._balls = this.manager.getByTag('ball');
        console.log(this.balls);
		this._audioTrack = this.services.get(AssetManager).audio.get('music');
		//this.audioTrack.play().catch((reason) => console.log(reason));
		// Connection logic here
	}

	update(gameTime: GameTime) {
		let pos = this.transform.getPosition(true);
        this.transform.setPosition(pos.x, pos.y, pos.z);
        
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
		this.canvas.context.fillStyle = this.color;
		this.canvas.context.fillRect(-this.collider.anchor.x, -this.collider.anchor.y, this.width, this.height);
		gr.end();
		super.draw(gameTime);
	
	}

	destroy() {
		// Remove cached references

		super.destroy();
	}
}