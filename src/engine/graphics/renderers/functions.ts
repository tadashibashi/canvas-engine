import { Rectangle } from "../../math/shapes/Rectangle";
import { IFrame } from "../types";
import { TextConfig } from "./interfaces/TextConfig";

export namespace Drawf {
    export function rectangle(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, width: number, height: number) {
        context.fillStyle = fillStyle;
        context.fillRect(x, y, width, height);
    }

    export function image(context: CanvasRenderingContext2D, image: HTMLImageElement, sourceRect: Rectangle, destRect: Rectangle) {
        context.drawImage(image, sourceRect.left, sourceRect.top, sourceRect.width, sourceRect.height, destRect.left, destRect.top, destRect.width, destRect.height);
    }

    export function frame(context: CanvasRenderingContext2D, frame: IFrame, img: HTMLImageElement, x: number, y: number) {
        // Rotate and translate to adjust to frame
        context.translate(x, y);
        let sourceWidth = frame.rect.width;
        let sourceHeight = frame.rect.height;
        let anchorX = frame.anchor.x;
        let anchorY = frame.anchor.y;
        if (frame.rotated) { 
            context.rotate(-Math.PI*0.5); 
            sourceWidth = frame.rect.height;
            sourceHeight = frame.rect.width;
            anchorX = frame.rect.height - frame.anchor.y;
            anchorY = frame.anchor.x;
        }
        
        // Draw frame image
        image(context, img, new Rectangle(frame.rect.x, frame.rect.y, sourceWidth, sourceHeight).setAnchor(0, 0), new Rectangle(-anchorX,-anchorY, sourceWidth, sourceHeight).setAnchor(0, 0));
        
        // Rotate and translate back to normal
        if (frame.rotated) { context.rotate(Math.PI*0.5); }
        context.translate(-x, -y);
    }

    export function circle(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, radius: number) {
        const lastFillStyle = context.fillStyle;
        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
        context.fillStyle = lastFillStyle;
    }

    export function line(context: CanvasRenderingContext2D, strokeStyle = 'gray', startPoint: Vector2Like, ...to: Vector2Like[]) {
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



    export function text(context: CanvasRenderingContext2D, config: TextConfig) {
        context.textAlign = config.textAlign || 'left';
        context.fillStyle = config.fillStyle || 'gray';
        context.font = config.fontSize + 'pt ' + config.fontFamily || '12pt Times';
        context.fillText(config.text || '', Math.round(config.position.x) || 0, Math.round(config.position.y) || 0);
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