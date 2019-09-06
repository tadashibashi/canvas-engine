import { Component } from './Component';
import { GameTime } from '../core/GameTime';

export abstract class DrawableComponent extends Component {
	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onDrawOrderChanged: ((component: Component, value: number) => void)[] = [];

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

	abstract draw(gameTime: GameTime): void;

	destroy() {
		this.onDrawOrderChanged = [];
		super.destroy();
	}
}