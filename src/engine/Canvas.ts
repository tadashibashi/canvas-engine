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
	guiCtx: CanvasRenderingContext2D;
	/**
	 * window.devicePixelRatio. On high-res devices this is usually set to 2
	 */
	dpr: number;
	virtualWidth: number;
	virtualHeight: number;
	get screenWidth(): number { return this.element.width};
	get screenHeight(): number { return this.element.height};
	scale: number;
	backgroundElement: HTMLCanvasElement;
	backgroundCtx: CanvasRenderingContext2D;
	pixelElement: HTMLCanvasElement;
	pixelCtx: CanvasRenderingContext2D;
	constructor(querySelector: string, width = 320, height = 180, scale = 2) {
		super(querySelector); // super constructor queries the element
		let canvas = this.element;
		this.scale = scale;
		this.guiCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.dpr = (window.devicePixelRatio || 1);

		const container = document.querySelector('#container') as HTMLDivElement;
		container.style.width = width*this.scale + 'px';
		container.style.height = height*this.scale + 'px';
		
		this.setCanvasDimensions(canvas, width, height);

		this.pixelElement = document.getElementById('pixel') as HTMLCanvasElement;
		this.setCanvasDimensions(this.pixelElement, width, height);
		this.pixelCtx = this.pixelElement.getContext('2d') as CanvasRenderingContext2D;

		this.backgroundElement = document.getElementById('background') as HTMLCanvasElement;
		this.setCanvasDimensions(this.backgroundElement, width, height);
		this.backgroundCtx = this.backgroundElement.getContext('2d') as CanvasRenderingContext2D;
		
		this.virtualWidth = width;
		this.virtualHeight = height;
		this.updateGUICanvasScale();
		//window.addEventListener('resize', this.updateCanvasScale);
	}

	setCanvasDimensions(canvas: HTMLCanvasElement, width: number, height: number) {
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = width * this.scale + 'px';
	}
	
	updateGUICanvasScale = (ev?: UIEvent) => {
		let rect = this.element.getBoundingClientRect();
		let scale = this.scale;
		this.element.width = rect.width * this.dpr;
		this.element.height = rect.height * this.dpr;
		this.guiCtx.scale(this.dpr*scale, this.dpr*scale);
	}

	destroy() {
		window.removeEventListener('resize', this.updateGUICanvasScale);
	}
}