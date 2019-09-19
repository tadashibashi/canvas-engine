import { Component } from '../Component';
import { GameTime } from '../../core/GameTime';
import { Game } from '../game/Game';

export class NewComponent extends Component {

	constructor() {
		super('tagname', 0); // Update Order
	}

	awake() {
		// Game.engine.services.get()
	}

	update(gameTime: GameTime) {
		// Update Logic

	}
}