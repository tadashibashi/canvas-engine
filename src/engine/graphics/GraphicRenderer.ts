import { Mathf } from "../math/functions";
import { DrawableComponent } from "../DrawableComponent";
import { Transform } from "../Transform";
import { GameTime } from "../GameTime";

/**
 * A GraphicRenderer must be on a ComponentManager that also contains a Transform component
 */
export class GraphicRenderer extends DrawableComponent {
	
	// ============== Dependencies =============== //
	/**
	 * Transform dependency. GraphicRenderer will render at its position.
	 */
	 get transform(): Transform {
	 	return this._transform as Transform;
	 }
	_transform: Transform | undefined;

	// ============== Properties ================= //
	/**
	 * Image offset in game pixel units
	 */
	readonly anchor: Vector2Like = {x: 0, y: 0};

	/**
	 * Image transparency/visibility (0 - 1)
	 * 1 is fully visible, 0 is fully invisible
	 */
	alpha = 1;

	private matrix = new DOMMatrix();
	/**
	 * Image rotation in radians (0 to 2PI).
	 * Getter and setter angle automatically make the conversion to and from radians/degrees.
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
		this._angle = Mathf.wrap(angle * Math.PI/180, 0, Math.PI*2);
	}

	/**
	 * Image scale/stretching multiple
	 */
	readonly scale: Vector2Like = {x: 1, y: 1};

	/**
	 * Whether or not this image will be rendered on the pixelRendering canvas
	 */
	pixelRendering = false;

	constructor(tag?: string | null, updateOrder = 0, drawOrder = 0) {
		super(tag, updateOrder, drawOrder);
	}

	// ================ Events =====================
	/**
	 * EVENT: Called by the ComponentManager. All child classes must call this via super.awake()
	 * The event to safely associate other components within the manager.
	 */
	create() {
        super.create();

		this._transform = this.manager.get(Transform);
	}

	update(gameTime: GameTime) {}

	/**
	 * EVENT: All drawing goes here. Must be implemented.
	 * Make sure to use -anchor.x and -anchor.y positions when drawing to implement anchor positions.
	 */
	draw(gameTime: GameTime): void {}

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
	 * Use start() before drawing anything in draw() you want to have scaling, position, rotation from the GraphicRenderer's variables.
	 * end() will restore the canvas context state after all drawing has taken place.
	 */
	start(): void {
		let context: CanvasRenderingContext2D;
		if (this.pixelRendering) {
			context = this.canvas.pixelCtx;
		} else {
			context = this.canvas.guiCtx;
		}
		let position = this.transform.getPosition();
		let scale = this.scale;
		this.matrix = context.getTransform();
		context.translate(Math.floor(position.x), Math.floor(position.y));
		context.scale(scale.x, scale.y);
		context.rotate(this._angle);
		context.globalAlpha = this.alpha;
	}

	/**
	 * Goes inside draw() after all drawing has taken place.
	 * Call this to restores canvas context to its prior state before start().
	 */
	end(): void {
		let context: CanvasRenderingContext2D;
		if (this.pixelRendering) {
			context = this.canvas.pixelCtx;
		} else {
			context = this.canvas.guiCtx;
		}
		context.setTransform(this.matrix);
	}

	destroy() {
		delete this._transform;
		super.destroy();
	}

}