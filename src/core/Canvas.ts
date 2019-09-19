export class DOMElementWrapper<E extends HTMLElement> {
	element: E;
	constructor(querySelector: string) {
		this.element = document.querySelector(querySelector) as E;
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

	constructor(querySelector: string, width = 320, height = 180) {
		super(querySelector); // super constructor queries the element
		let canvas = this.element;

		this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = width + 'px';
		this.dpr = window.devicePixelRatio || 1;
		this.virtualWidth = width;
		this.virtualHeight = height;
		this.updateCanvasScale();
		window.addEventListener('resize', this.updateCanvasScale);
	}
	
	updateCanvasScale = (ev?: UIEvent) => {
		let rect = this.element.getBoundingClientRect();
		this.element.width = rect.width * this.dpr;
		this.element.height = rect.height * this.dpr;
		this.context.scale(this.dpr, this.dpr);
	}

	destroy() {
		window.removeEventListener('resize', this.updateCanvasScale);
	}
}