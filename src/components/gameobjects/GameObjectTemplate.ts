import { GameObject } from '../gameobjects/GameObject';
import { GameTime } from '../../core/GameTime';

export class GameObjectTemplate extends GameObject {
	// cache components here
	
	constructor(x: number, y: number) {
        super('tagname', { x: x, y: y });

		// add components here

	}

	awake() {
		super.awake();
		
		// Connection logic here
	}

	update(gameTime: GameTime) {
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