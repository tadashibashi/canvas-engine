import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { TypeContainer } from '../../core/TypeContainer';
import { InputManager } from '../input/InputManager';
import { Pointer } from '../input/sources/Pointer';
import { PointerCodes, Input } from '../input/types/Types';

export interface GameConfig {
	canvasID: string;
	width: number;
	height: number;
	pixelated: boolean
}

export class Game extends DrawableComponent {
	static engine: Game;
	readonly services = new TypeContainer();
	readonly components = new ComponentManager();
	left: Input;
	constructor(config: GameConfig) {
		super();
		Game.engine = this;
		let canvas = document.getElementById(config.canvasID) as HTMLCanvasElement;
		let context = canvas.getContext('2d');
		let input = new InputManager();
		
		this.services
			.set(context)
			.set(canvas)
			.set(input);

		this.components
			.add(input);
	} 

	awake() {
		this.left = this.services.get(InputManager).pointer.add(PointerCodes.LEFT);
		this.components.awake();
	}

	update(gameTime: GameTime) {
		let input = this.services.get(InputManager);
		let pointer = input.sources.get(Pointer);

		//console.log(pointer.position.x, pointer.position.lastX);
		if (pointer.justDown(this.left)) {
			console.log('hello, you clicked left!');
		}
		if (pointer.justUp(this.left)) {
			console.log('goodbey, you just unclicked left!!');
		}

		this.components.update(gameTime);

	}

	draw(gameTime: GameTime) {
		let context = this.services.get(CanvasRenderingContext2D);
		context.fillStyle = 'black';
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

	}
}