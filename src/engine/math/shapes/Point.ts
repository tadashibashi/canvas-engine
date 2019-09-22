import { Shape } from "./Shape";

export class Point extends Shape {
    constructor(x: number, y: number, z?: number) {
        super(x, y, z);
    }
    
    setAnchorExt(x: number, y: number, xPixels?: number | undefined, yPixels?: number | undefined): this {
        this.setAnchor(x + (xPixels || 0), y + (yPixels || 0), this.z);
        return this;
    }
}