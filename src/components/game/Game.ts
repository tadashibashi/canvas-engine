import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { TypeContainer } from '../../core/TypeContainer';
import { InputManager } from '../input/InputManager';
import { Pointer } from '../input/sources/Pointer';
import { PointerCodes, Input, KeyCodes } from '../input/types/Types';
import { Canvas } from '../../core/Canvas';
import { Keyboard } from '../input/sources/Keyboard';


export interface GameConfig {
	readonly canvasID: string;
	readonly width?: number;
	readonly height?: number;
	readonly backgroundColor?: string;
	readonly pixelated: boolean
}

export class Game extends DrawableComponent {
	static engine: Game;
	readonly services = new TypeContainer();
	readonly components = new ComponentManager();
	left: Input;
	constructor(public readonly config: GameConfig) {
		super();
		Game.engine = this;

		let canvas = new Canvas('#' + config.canvasID, 320, 180, config.backgroundColor);

		let input = new InputManager();
		
		this.services
			.set(canvas)
			.set(input);

		this.components
			.add(input);

	} 

	awake() {
		this.left = this.services.get(InputManager).keyboard.add(KeyCodes.LEFT_ARROW);
		this.components.awake();
	}

	update(gameTime: GameTime) {
		let input = this.services.get(InputManager);
		let keyboard = input.sources.get(Keyboard);
		input.preUpdate(gameTime);
		
		//console.log(pointer.position.x, pointer.position.lastX);
		if (keyboard.justDown(this.left)) {
			console.log('just hit left');
		}
		if (keyboard.justUp(this.left)) {
			console.log('just released left');
		}

		this.components.update(gameTime);	
	}

	draw(gameTime: GameTime) {
		let canvas = this.services.get(Canvas);
		let context = canvas.context;
		context.fillStyle = canvas.backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	}
}