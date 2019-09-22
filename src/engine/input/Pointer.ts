import { InputSource } from "./InputSource";
import { Game } from "../Game";
import { Canvas } from "../Canvas";
import { GameTime } from "../GameTime";

export class Pointer extends InputSource<PointerEvent> {
	position = {x: 0, y: 0, lastX: 0, lastY: 0};
	scale: number = 1;

	constructor() {
		super(-9999);
	}

	awake() {
		super.awake();
		let canvas = Game.engine.services.get(Canvas) as Canvas;
		this.scale = canvas.element.width / canvas.element.clientWidth / window.devicePixelRatio / canvas.scale;
		window.addEventListener('pointermove', this.updatePointerPos);
		window.addEventListener('pointerdown', this.queueEvent);
		window.addEventListener('pointerup', this.queueEvent);
		this.onInput.subscribe(this.processButtonPress, this);
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
		let pos = this.screenToWorld(ev.clientX, ev.clientY);
		this.position.x = pos.x;
		this.position.y = pos.y;
	}

	screenToWorld(x: number, y: number): Vector2Like {
		let canvas = Game.engine.services.get(Canvas);
		let rect = canvas.element.getBoundingClientRect();
		let root = document.documentElement;

		let _x = (x - rect.left -(root.scrollLeft*this.scale)) * this.scale;
		let _y = (y - rect.top -(root.scrollTop*this.scale)) * this.scale;
		return {x: _x, y: _y};
	}

	destroy() {
		window.removeEventListener('pointermove', this.updatePointerPos);
		window.removeEventListener('pointerdown', (ev) => {this.queueEvent(ev)});
		window.removeEventListener('pointerup', (ev) => {this.queueEvent(ev)});
		this.onInput.unsubscribeAll();
		super.destroy();
	}
}