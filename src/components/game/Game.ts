import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';

export interface GameConfig {
	canvasID: string;
	width: number;
	height: number;
	pixelated: boolean
}

export class Game extends DrawableComponent {
	static engine: Game;
	services = new Map<new(...any: any[])=> any, any>();

	constructor(config: GameConfig) {
		super();
		Game.engine = this;
		document

		
	}

	update(gameTime: GameTime) {

	}

	draw(gameTime: GameTime) {

	}
}