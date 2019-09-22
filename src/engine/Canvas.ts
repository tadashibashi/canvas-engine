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
	scale = 2;
	pixelElement: HTMLCanvasElement;
	pixelCtx: CanvasRenderingContext2D;
	constructor(querySelector: string, width = 320, height = 180) {
		super(querySelector); // super constructor queries the element
		let canvas = this.element;

		this.guiCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
		this.dpr = (window.devicePixelRatio || 1);

		const container = document.querySelector('#container') as HTMLDivElement;
		container.style.width = width*this.scale + 'px';
		container.style.height = height*this.scale + 'px';
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = width*this.scale + 'px';
		const prCanvas = document.getElementById('pixelRender') as HTMLCanvasElement;
		this.pixelElement = prCanvas;
		prCanvas.width = width;
		prCanvas.height = height;
		prCanvas.style.width = width*this.scale + 'px';
		console.log('PixelRenderingCanvas Style Width:', prCanvas.style.width)
		const prCtx = prCanvas.getContext('2d') as CanvasRenderingContext2D;
		this.pixelCtx = prCtx;

		this.guiCtx.imageSmoothingEnabled = false;
		
		this.virtualWidth = width;
		this.virtualHeight = height;
		//this.updateCanvasScale();
		this.updateCanvasScale();
		window.addEventListener('resize', this.updateCanvasScale);
	}
	
	updateCanvasScale = (ev?: UIEvent) => {
		let rect = this.element.getBoundingClientRect();
		let scale = this.scale;
		this.element.width = rect.width * this.dpr;
		this.element.height = rect.height * this.dpr;
		this.guiCtx.scale(this.dpr*scale, this.dpr*scale);
	}

	destroy() {
		window.removeEventListener('resize', this.updateCanvasScale);
	}
}