import { Shape } from "./Shape";

export class Circle extends Shape implements CircLike {
    radius: number;

    constructor(x: number, y: number, radius: number) {
        super(x, y, 0);
        this.radius = radius;
        this.setAnchorExt(.5,.5);
    }

    get left() {
        return this.x - this.anchor.x - this.radius;
    }
    get right() {
        return this.x - this.anchor.x + this.radius;
    }
    get top() {
        return this.y - this.anchor.y - this.radius;
    }
    get bottom() {
        return this.y - this.anchor.y + this.radius;
    }

        /**
     * Sets the anchor by percentage of width and height, and then optional additional pixels
     * @param x 
     * @param y
     * @param xPixels
     * @param yPixels
     */
    setAnchorExt(x: number, y: number, xPixels = 0, yPixels = 0) {
        const radius = this.radius;
        const diam = radius * 2;
        this.anchor.x = -radius + (x*diam) + xPixels;
        this.anchor.y = -radius + (y*diam) + yPixels;
        return this;
    }
}