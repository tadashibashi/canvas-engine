import { Shape } from "./Shape";

export class Point extends Shape {
    constructor(x: number, y: number, z?: number) {
        super(x, y, z);
    }
}