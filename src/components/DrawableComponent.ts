import { Component } from './Component';
import { GameTime } from '../core/GameTime';
import { Canvas } from '../core/Canvas';

export abstract class DrawableComponent extends Component {
	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onDrawOrderChanged: ((component: Component, value: number) => void)[] = [];
	canvas: Canvas

	private _drawOrder: number;
	get drawOrder() {return this._drawOrder;}
	set drawOrder(val: number) {
		this._drawOrder = val;
		if (this.onDrawOrderChanged) {
			this.onDrawOrderChanged.forEach((fn) => {
				fn(this, val);
			});
		}
	}

	constructor(updateOrder = 0, drawOrder = 0) {
		super(updateOrder);
		this._drawOrder = drawOrder;
	}

	awake() {
		super.awake();
		this.canvas = this.services.get(Canvas);
	}

	abstract draw(gameTime: GameTime): void;

	destroy() {
		this.onDrawOrderChanged = [];
		super.destroy();
	}
}