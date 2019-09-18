import { ComponentManager } from '../ComponentManager';
import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { Transform } from '../transform/Transform';

export class GameObject extends DrawableComponent {
	components: ComponentManager;

	get transform(): Transform {
		return this._transform as Transform;
	}
    private _transform: Transform | undefined;


	/**
	 * Scene should subscribe to this and remove all references to this object
	 */
    constructor(tag?: string | null, pos?: {x?: number, y?: number, z?: number}) {
        super(tag, 0, 0);
        if (pos) {
            this._transform = new Transform(pos.x, pos.y, pos.z);
        } else {
            this._transform = new Transform();
        }
		    
		this.components = new ComponentManager();
		this.components.add(this._transform);
	}

	awake() {
		super.awake();
		this.components.awake();
	}

	update(gameTime: GameTime) {
		this.components.update(gameTime);
	}

	draw(gameTime: GameTime) {
		this.components.draw(gameTime);
	}

	destroy() {
		this.components.destroy();
		this._transform = undefined;

		super.destroy();
	}
}