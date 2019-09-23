import { Component } from "./Component";
import { Delegate } from "./utility/Delegate";
import { Canvas } from "./Canvas";
import { GameTime } from "./GameTime";
import { Game } from "./Game";

export abstract class DrawableComponent extends Component {
	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onDrawOrderChanged = new Delegate<(component: Component, value: number) => void>();
	
	/**
	 * Reference to the canvas wrapper. Must be referenced after super.awake().
	 * Use this.canvas.context to draw
	 */
	canvas!: Canvas;

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
	/** Internal drawOrder variable. Set this to bypass the onDrawOrderChanged callback. */
	private _drawOrder: number;

	constructor(tag?: string | null, updateOrder = 0, drawOrder = 0) {
		super(tag, updateOrder);
		this._drawOrder = drawOrder;
		this.canvas = Game.engine.canvas;
		console.log(this.canvas);
	}
	
	create(): void {};

	abstract draw(gameTime: GameTime): void;


	destroy() {
		this.onDrawOrderChanged.unsubscribeAll();
		super.destroy();
	}
}