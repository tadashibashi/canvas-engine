export namespace Draw {
    export function rectangle(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, width: number, height: number) {
        context.fillStyle = fillStyle;
        context.fillRect(x, y, width, height);
    }

    export function circle(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, radius: number) {
        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }

    export function line(context: CanvasRenderingContext2D, strokeStyle = 'gray', startPoint: Vector2, ...to: Vector2[]) {
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

    export interface TextConfig {
        position: Vector2;
        fontFamily: string;
        fontSize: number;
        text: string;
        fillStyle?: string;
        strokeStyle?: string;
        textAlign?: 'start' | 'end' | 'left' | 'center' | 'right';
    }

    export function text(context: CanvasRenderingContext2D, config: TextConfig) {
        context.textAlign = config.textAlign || 'left';
        context.fillStyle = config.fillStyle || 'gray';
        context.font = config.fontSize + 'px ' + config.fontFamily || '12px Times';
        context.fillText(config.text || '', config.position.x || 0, config.position.y || 0);
    }

    export function arc(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, radius: number, startDeg: number, deg: number, counterClockwise = false) {
        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x, y, radius, startDeg / Math.PI * 2, deg / Math.PI * 2, counterClockwise);
        context.fill();
        context.closePath();
    }

	/**
	 *	Takes rgba color values and outputs them as a string usable for fillStyle in drawing
	 * @param r red (0-255)
	 * @param g green (0-255)
	 * @param b blue (0-255)
	 * @param a alpha (0-1) where 0 is fully transparent, and 1 is fully visible
	 */
    export function rgba(r: number, g: number, b: number, a: number): string {
        return `rgba(${r},${g},${b},${a})`;
    }
    /**
	 *	Takes rgb color values and outputs them as a string usable for fillStyle in drawing
	 * @param r red (0-255)
	 * @param g green (0-255)
	 * @param b blue (0-255)
	 */
    export function rgb(r: number, g: number, b: number): string {
        return `rgba(${r},${g},${b})`;
    }
}