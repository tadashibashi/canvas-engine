import { ICollidable } from "./types";
import { DelegateGroup } from "../../utility/DelegateGroup";

export class Collision {
    obj1: ICollidable | ICollidable[];
    obj2: ICollidable | ICollidable[];
    events = new DelegateGroup<'enter' | 'exit' | 'collide', (obj1: ICollidable, obj2: ICollidable) => void>('enter', 'exit', 'collide');
    lastCollide = false;
    didCollide = false;

    constructor(obj1: ICollidable | ICollidable[], obj2: ICollidable | ICollidable[]) {
        this.obj1 = obj1;
        this.obj2 = obj2;
    }
}