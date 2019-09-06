import { InputSource } from './InputSource';
import { Game } from '../../game/Game';
import { GameTime } from '../../../core/GameTime';

export class Pointer extends InputSource<PointerEvent> {
	position = {x: 0, y: 0, lastX: 0, lastY: 0};
	scale: number;

	constructor() {
		super(0);
	}

	update(gameTime: GameTime) {
		this.position.lastX = this.position.x;
		this.position.lastY = this.position.y;
		super.update(gameTime);
	}

	awake() {
		let canvas = Game.engine.services.get(HTMLCanvasElement);
		this.scale = canvas.width/canvas.clientWidth/window.devicePixelRatio;
		window.addEventListener('pointermove', this.updatePointerPos);
		window.addEventListener('pointerdown', this.queueEvent);
		window.addEventListener('pointerup', this.queueEvent);
	}

	onInput = (ev: PointerEvent) => {
		let index = this.getIndexByCode(ev.button);
		if (index !== -1) {
			// will need to modify later if adding more event listeners that might interfere
		  this.inputs[index].axis = (ev.type === 'pointerdown')? 1 : 0;
		  console.log(ev);
		}
	}

	updatePointerPos = (ev: PointerEvent) => {
		let rect = Game.engine.services.get(HTMLCanvasElement).getBoundingClientRect();
		let root = document.documentElement;

		this.position.x = (ev.clientX - rect.left - root.scrollLeft) * this.scale;
		this.position.y = (ev.clientY - rect.top - root.scrollTop) * this.scale;
	}

	destroy() {
		window.removeEventListener('pointermove', this.updatePointerPos);
		window.removeEventListener('pointerdown', (ev) => {this.queueEvent(ev)});
		window.removeEventListener('pointerup', (ev) => {this.queueEvent(ev)});
	}
}