import { Shape } from "./Shape";

export class Point extends Shape {
    constructor(x: number, y: number, z?: number) {
        super(x, y, z);
    }
    
    get left(): number {
        return this.x - this.anchor.x;
    }
    get right(): number {
        return this.x - this.anchor.x;
    }
    get top(): number {
        return this.y - this.anchor.y;
    }
    get bottom(): number {
        return this.y - this.anchor.y;
    }

    setAnchorExt(x: number, y: number, xPixels?: number | undefined, yPixels?: number | undefined): this {
        this.setAnchor(x + (xPixels || 0), y + (yPixels || 0), this.z);
        return this;
    }
}