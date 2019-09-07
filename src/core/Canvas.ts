export class DOMElementWrapper<E extends HTMLElement> {
	element: E;
	constructor(querySelector: string) {
		this.element = document.querySelector(querySelector);
		if (!this.element) {
			console.log('Error! Element not found from query:', querySelector);
		}
	}
}

export class Canvas extends DOMElementWrapper<HTMLCanvasElement> {
	context: CanvasRenderingContext2D;
	/**
	 * window.devicePixelRatio. On high-res devices this is usually set to 2
	 */
	dpr: number;
	virtualWidth: number;
	virtualHeight: number;
	get screenWidth(): number { return this.element.width};
	get screenHeight(): number { return this.element.height};
	backgroundColor: string;

	constructor(querySelector: string, width = 320, height = 180, backgroundColor = 'black') {
		super(querySelector); // super constructor queries the element
		let canvas = this.element;
		this.context = canvas.getContext('2d');
		this.dpr = window.devicePixelRatio || 1;
		this.virtualWidth = width;
		this.virtualHeight = height;
		this.backgroundColor = backgroundColor;
		this.updateCanvasScale();
		//window.addEventListener('resize', this.updateCanvasScale);
	}
	
	updateCanvasScale = (ev?: UIEvent) => {
		this.element.width = this.virtualWidth;
		this.element.height = this.virtualHeight;
		this.context.scale(1, 1);
	}

	destroy() {
		window.removeEventListener('resize', this.updateCanvasScale);
	}
}