import { Shape } from "./Shape";

export class Circle extends Shape implements CircLike {
    radius: number;

    constructor(x: number, y: number, radius: number) {
        super(x, y, 0);
        this.radius = radius;
    }
}