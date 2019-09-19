import { IAnchor } from "../../core/Interfaces";

export abstract class Shape implements Vector3, IAnchor {
    x = 0;
    y = 0;
    z = 0;
    anchor: Vector3 = { x: 0, y: 0, z: 0 };

    constructor(x: number, y: number, z?: number) {
        this.setPosition(x, y, z);
    }

    setAnchor(x: number, y: number, z?: number) {
        const a = this.anchor;
        a.x = x;
        a.y = y;
        a.z = z || a.z;
    }

    setPosition(x: number, y?: number, z?: number): this {
        this.x = x;
        this.y = y || this.y;
        this.z = z || this.z;
        return this;
    }
}