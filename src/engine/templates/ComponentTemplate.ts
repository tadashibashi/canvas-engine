import { Component } from "../Component";
import { GameTime } from "../GameTime";

export class NewComponent extends Component {

	constructor() {
		super('tagname', 0); // Update Order
	}

	create() {
		// Game.engine.services.get()
	}

	update(gameTime: GameTime) {
		// Update Logic

	}
}