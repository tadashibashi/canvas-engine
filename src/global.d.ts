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
     * z-coordinate of the top-left position
     */
    z?: number;
	/**
	 * rectangle width
	 */
	width: number;
	/**
	 * rectangle height
	 */
	height: number;
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
	 * z-coordinate of the center position
	 */
    z?: number;
	
	/**
	 * circle radius
	 */
	radius: number;
}


declare interface KeyPath {
	key: string;
	filepath: string;
}
