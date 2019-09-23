import { GameObject } from "../gameobjects/GameObject";
import { GameTime } from "../GameTime";

export class GameObjectTemplate extends GameObject {
	// cache components here
	
	constructor() {
        super('tagname');

		// add components here

	}

	create() {

		
		super.create();
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