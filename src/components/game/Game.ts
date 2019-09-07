import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { TypeContainer } from '../../core/TypeContainer';
import { InputManager } from '../input/InputManager';
import { Pointer } from '../input/sources/Pointer';
import { PointerCodes, Input, KeyCodes } from '../input/types/Types';
import { Canvas } from '../../core/Canvas';
import { Keyboard } from '../input/sources/Keyboard';
import { GraphicRenderer } from '../graphics/GraphicRenderer';
import { Draw } from '../../core/Draw';
import { Transform } from '../transform/Transform';


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
	right: Input;
	constructor(public readonly config: GameConfig) {
		super();
		Game.engine = this;

		let canvas = new Canvas('#' + config.canvasID, 320, 180, config.backgroundColor);

		let input = new InputManager();
		let gr = new GraphicRenderer();
		gr.setAnchor(-200, -100);
		gr.update = (gameTime: GameTime) => {
			gr.angle += 100 * gameTime.deltaSec;
		} 
		gr.draw = (gameTime: GameTime) => {

			gr.start();

			Draw.circ(canvas.context, {x: -gr.anchor.x, y: -gr.anchor.y, r:100});

			gr.end();
			Draw.text(canvas.context, {
				fillStyle: 'green',
				fontFamily: 'Georgia',
				fontSize: 12,
				position: {x: 10 + gr.transform.position.x, y: 15 + gr.transform.position.y},
				strokeStyle: 'none',
				text: 'hello',
				textAlign: 'left'
			});
		}
		this.services
			.set(canvas)
			.set(input);

		this.components
			.add(input)
			.add(gr)
			.add(new Transform(100, 100, 10));

	} 

	awake() {
		super.awake();
		this.left = this.services.get(InputManager).keyboard.add(KeyCodes.A);
		this.right = this.services.get(InputManager).keyboard.add(KeyCodes.D);
		this.components.awake();
	}

	update(gameTime: GameTime) {
		let input = this.services.get(InputManager);
		let keyboard = input.sources.get(Keyboard);
		input.preUpdate(gameTime);
		
		//console.log(pointer.position.x, pointer.position.lastX);
		if (this.left.axis === 1) {
			this.canvas.context.translate(1, 0);
		}
		if (this.right.axis === 1) {
			this.canvas.context.translate(-1, 0);
		}
		if (keyboard.justUp(this.left)) {
			console.log('just released left');
		}

		this.components.update(gameTime);	
	}

	draw(gameTime: GameTime) {
		let canvas = this.canvas;
		let context = canvas.context;
		context.fillStyle = canvas.backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		this.components.draw(gameTime);
	}
}