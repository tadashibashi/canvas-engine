export class Draw {
	static rect(context: CanvasRenderingContext2D, rect: Rect, fillStyle = 'gray', strokeStyle = 'none') {
		context.fillStyle = fillStyle;
		context.strokeStyle = strokeStyle;
		context.rect(rect.x, rect.y, rect.w, rect.h);
		if (fillStyle !== 'none')
			context.fill();
		if (strokeStyle !== 'none')
			context.stroke();
	}

	static line(context: CanvasRenderingContext2D, strokeStyle = 'gray', startPoint: Vector2, ...to: Vector2[]) {
		context.beginPath();
		let path = new Path2D();
		path.moveTo(startPoint.x, startPoint.y);
		to.forEach((point) => {
			path.lineTo(point.x, point.y);
		});
		context.closePath();

		context.strokeStyle = strokeStyle;

		context.stroke(path);
	}

	static text(context: CanvasRenderingContext2D, config: TextConfig) {
		context.textAlign = config.textAlign? config.textAlign : 'left';
		context.fillStyle = config.fillStyle? config.fillStyle : 'gray';
		context.font = config.fontSize + 'px ' + config.fontFamily;
		context.fillText(config.text, config.position.x, config.position.y);
	}

	static circ(context: CanvasRenderingContext2D, circ: Circ, fillStyle = 'gray', strokeStyle = 'none') {


		context.beginPath();
		context.arc(circ.x, circ.y, circ.r, 0, Math.PI*2, false);
		context.closePath();

		context.fillStyle = fillStyle;
		context.strokeStyle = strokeStyle;
		context.stroke();
		context.fill();

	}

	static image() {

	}

	static rgb(r: number, g: number, b: number): string {
		return `rgba(${r},${g},${b})`;
	}

	static rgba(r: number, g: number, b: number, a: number): string {
		return `rgba(${r},${g},${b},${a})`;
	}	

}