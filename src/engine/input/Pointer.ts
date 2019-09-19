import { InputSource } from "./InputSource";
import { Game } from "../Game";
import { Canvas } from "../utility/Canvas";
import { GameTime } from "../GameTime";

export class Pointer extends InputSource<PointerEvent> {
	position = {x: 0, y: 0, lastX: 0, lastY: 0};
	scale: number = 1;

	constructor() {
		super(1000);
	}

	awake() {
		super.awake();
		let canvas = Game.engine.services.get(Canvas) as Canvas;
		this.scale = canvas.element.width/canvas.element.clientWidth/window.devicePixelRatio;
		window.addEventListener('pointermove', this.updatePointerPos);
		window.addEventListener('pointerdown', this.queueEvent);
		window.addEventListener('pointerup', this.queueEvent);
		this.onInput.subscribe(this, this.processButtonPress);
	}

	update(gameTime: GameTime) {
		this.position.lastX = this.position.x;
		this.position.lastY = this.position.y;
		super.update(gameTime);
	}
	
	processButtonPress(ev: PointerEvent) {
		let index = this.getIndexByCode(ev.button);
		if (index !== -1) {
			// will need to modify later if adding more event listeners that might interfere
		  this.inputs[index].axis = (ev.type === 'pointerdown')? 1 : 0;
		}
	}

	updatePointerPos = (ev: PointerEvent) => {
		let canvas = Game.engine.services.get(Canvas);
		let rect = canvas.element.getBoundingClientRect();
		let root = document.documentElement;

		// Take positional, scrolling, and scale offset into account. Screen to World Conversion.
		this.position.x = (ev.clientX - rect.left - root.scrollLeft) * this.scale;
		this.position.y = (ev.clientY - rect.top - root.scrollTop) * this.scale;
	}

	destroy() {
		window.removeEventListener('pointermove', this.updatePointerPos);
		window.removeEventListener('pointerdown', (ev) => {this.queueEvent(ev)});
		window.removeEventListener('pointerup', (ev) => {this.queueEvent(ev)});
		this.onInput.unsubscribeAll();
		super.destroy();
	}
}