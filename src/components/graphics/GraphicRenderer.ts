import { DrawableComponent } from '../DrawableComponent';
import { Transform } from '../transform/Transform';
import { Mathf } from '../../core/Mathf';
import { Canvas } from '../../core/Canvas';
import { GameTime } from '../../core/GameTime';

/**
 * A GraphicRenderer must be on a ComponentManager that also contains a Transform component
 */
export abstract class GraphicRenderer extends DrawableComponent {
	/**
	 * Image offset in game pixel units
	 */
	readonly anchor: Vector2 = {x: 0, y: 0};
	/**
	 * Image transparency/visibility (0 - 1)
	 * 1 is fully visible, 0 is fully invisible
	 */
	alpha = 1;
	/**
	 * Image rotation in radians (0 to 2PI)
	 */
	private _angle = 0;
	/**
	 * Get or set the value of the angle in degrees (0 - 360)
	 */
	get angle() {return this._angle / Math.PI * 180;}
	/**
	 * @param angle The number of degrees to set the angle. 
	 * Automatically wraps it to a number between 0 and 360.
	 */
	set angle(angle: number) {
		this._angle = Mathf.wrap(angle, 0, angle * Math.PI / 180);
	}
	/**
	 * Image scale/stretching multiple
	 */
	readonly scale: Vector2 = {x: 1, y: 1};
	/**
	 * Whether or not this image will have Math.floor() applied to its render position
	 */
	pixelLock = false;
	/**
	 * Transform dependency. GraphicRenderer will render at its position.
	 */
	transform: Transform;

	canvas: Canvas;

	constructor(updateOrder = 0, drawOrder = 0) {
		super(updateOrder, drawOrder);
	}

	// ================ Events =====================
	/**
	 * EVENT: Called by the ComponentManager. All child classes must call this via super.awake()
	 * The event to safely associate other components within the manager.
	 */
	awake() {
		this.transform = this.manager.get(Transform);
		this.canvas = this.services.get(Canvas);
	}
	/**
	 * EVENT: All drawing goes here. Must be implemented.
	 * Make sure to use -anchor.x and -anchor.y positions when drawing to implement anchor positions.
	 */
	abstract draw(gameTime: GameTime): void;

	// ============ Expressive Setters ==============
	/**
	 * Sets anchor
	 */
	setAnchor(x: number, y: number): this {
		this.anchor.x = x;
		this.anchor.y = y;
		return this;
	}
	/**
	 * Sets alpha to a number between 0 and 1.
	 * @param alpha The value to set alpha to.
	 */
	setAlpha(alpha: number): this {
		this.alpha = Mathf.clamp(alpha, 0, 1);
		return this;
	}

	// =============== Drawing ===================

	/**
	 * Saves canvas context state, then alters with the GraphicRenderer's own parameters.
	 * Use start() before drawing anything in draw(). 
	 * end() will restore the canvas context state after all drawing has taken place.
	 */
	protected start(): void {
		let context = this.canvas.context;
		let position = this.transform.position;
		let scale = this.scale;
		context.save();
		context.translate(position.x, position.y);
		context.scale(scale.x, scale.y);
		context.rotate(this._angle);
		context.globalAlpha = this.alpha;
	}

	/**
	 * Goes inside draw() after all drawing has taken place.
	 * Call this to restores canvas context to its prior state before start().
	 */
	protected end(): void {
		this.canvas.context.restore();
	}

}