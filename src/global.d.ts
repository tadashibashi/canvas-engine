declare interface Vector2 {
	x: number;
	y: number;
}

declare interface Vector3 {
	x: number;
	y: number;
	z: number;
}

declare interface Rect {
	/**
	 * x-coordinate of the top-left position
	 */
	x: number;
	/**
	 * y-coordinate of the top-left position
	 */
	y: number;
	/**
	 * rectangle width
	 */
	w: number;
	/**
	 * rectangle height
	 */
	h: number;
}

declare interface Circ {
	/**
	 * x-coordinate of the center position
	 */
	x: number;

	/**
	 * y-coordinate of the center position
	 */
	y: number;
	
	/**
	 * circle radius
	 */
	r: number;
}

declare interface TextConfig {
	position: Vector2;
	fontFamily: string;
	fontSize: number;
	text: string;
	fillStyle?: string;
	strokeStyle?: string;
	textAlign?: 'start' | 'end' | 'left' | 'center' | 'right';
}