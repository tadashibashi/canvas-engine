import { Component } from "./Component";
import { Delegate } from "./utility/Delegate";
import { Canvas } from "./Canvas";
import { GameTime } from "./GameTime";

export abstract class DrawableComponent extends Component {
	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	readonly onDrawOrderChanged = new Delegate<(component: Component, value: number) => void>();
	
	/**
	 * Reference to the canvas wrapper
	 * Use this.canvas.context to draw
	 */
	get canvas(): Canvas {
		return this._canvas as Canvas;
	}
	private _canvas: Canvas | undefined;

	/**
	 * Depth within drawable components in a ComponentManager.
	 * Lower is closer to the camera; higher is deeper/behind
	 */
	get drawOrder() {return this._drawOrder;}
	set drawOrder(val: number) {
		if (this._drawOrder !== val) {
			this._drawOrder = val;
			this.onDrawOrderChanged.send(this, val);
		}
		
	}
	private _drawOrder: number;

	constructor(tag?: string | null, updateOrder = 0, drawOrder = 0) {
		super(tag, updateOrder);
		this._drawOrder = drawOrder;
	}
	
	awake() {
		super.awake();
		this._canvas = this.services.get(Canvas);
	}

	abstract draw(gameTime: GameTime): void;


	destroy() {
		this.onDrawOrderChanged.unsubscribeAll();
		this._canvas = undefined;
		super.destroy();
	}
}