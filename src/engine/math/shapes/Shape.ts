import { IAnchor } from "../../types/interfaces";

export abstract class Shape implements Vector3Like, IAnchor {
    x = 0;
    y = 0;
    z = 0;
    anchor: Vector3Like = { x: 0, y: 0, z: 0 };

    constructor(x: number, y: number, z?: number) {
        this.setPosition(x, y, z);
    }

    setAnchor(x: number, y: number, z?: number) {
        const a = this.anchor;
        a.x = x;
        a.y = y;
        a.z = z || a.z;
        return this;
    }

    abstract setAnchorExt(x: number, y: number, xPixels?: number, yPixels?: number): this;

    setPosition(x: number, y?: number, z?: number): this {
        this.x = x;
        this.y = y || this.y;
        this.z = z || this.z;
        return this;
    }
}