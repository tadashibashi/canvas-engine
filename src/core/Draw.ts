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
		context.moveTo(startPoint.x, startPoint.y);
		to.forEach((point) => {
			context.lineTo(point.x, point.y);
		});
		context.closePath();

		if (strokeStyle !== 'none')
			context.strokeStyle = strokeStyle;

		context.stroke();
	}

	static text(context: CanvasRenderingContext2D, config: TextConfig) {
		context.textAlign = config.textAlign? config.textAlign : 'left';
		context.fillStyle = config.fillStyle? config.fillStyle : 'gray';
		context.font = config.fontSize + 'px ' + config.fontFamily;\
		context.strokeStyle = config.strokeStyle? config.strokeStyle : 'none';
		context.fillText(config.text, config.position.x, config.position.y);
		context.stroke();
	}

	static circ(context: CanvasRenderingContext2D, circ: Circ, fillStyle = 'gray', strokeStyle = 'none') {
		context.beginPath();
		context.arc(circ.x, circ.y, circ.r, 0, Math.PI*2, false);
		context.closePath();
		context.fillStyle = fillStyle;
		context.strokeStyle = strokeStyle;
		if (fillStyle !== 'none')
			context.fill();
		if (strokeStyle !== 'none')
			context.stroke();
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