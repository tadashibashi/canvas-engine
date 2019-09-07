import { ComponentManager } from '../ComponentManager';
import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { Transform } from '../transform/Transform';
import { Delegate } from '../../core/Delegate';

export class GameObject extends DrawableComponent {
	components: ComponentManager;
	transform: Transform;
	onDestroy = new Delegate<(gameObject: GameObject)=>void>();
	constructor(updateOrder = 0, drawOrder = 0) {
		super(updateOrder, drawOrder);
		this.transform = new Transform(100);
		this.components = new ComponentManager()
		this.components.add(this.transform);
	}

	awake() {
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
		this.onDestroy.send(this);		
		super.destroy();
	}


}