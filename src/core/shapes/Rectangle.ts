import { Shape } from "./Shape";

export class Rectangle extends Shape implements Rect {

    width: number;
    height: number;
    get left(): number {
        return this.x - this.anchor.x;
    }
    get top(): number {
        return this.y - this.anchor.y;
    }
    get bottom(): number {
        return this.top + this.height;
    }
    get right(): number {
        return this.left + this.width;
    }

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, 0);
        this.width = width;
        this.height = height;
        this.setAnchorExt(0.5, 0.5);
    }

    /**
     * Sets the anchor by percentage of width and height, and then optional additional pixels
     * @param x 
     * @param y
     * @param xPixels
     * @param yPixels
     */
    setAnchorExt(x: number, y: number, xPixels = 0, yPixels = 0) {
        this.anchor.x = (x*this.width) + xPixels;
        this.anchor.y = (y*this.height) + yPixels;
        return this;
    }


}