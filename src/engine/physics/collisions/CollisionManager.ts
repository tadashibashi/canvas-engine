import { Component } from "../../Component";
import { Collision } from "./Collision";
import { GameTime } from "../../GameTime";
import { ICollidable } from "./types";
import { ComponentManager } from "../../ComponentManager";

export class CollisionManager extends Component {
    private collisions = new ComponentManager<Collision<any, any>>();
    constructor() {
        super(null, 10000); // <- update order delayed so that movement calculations come before
    }

    create() {};
    
    update(gameTime: GameTime) {
        this.collisions.forEach((coll) => coll.update());
    }

    /**
     * Will return a collision with this signature whether already existing, or in creating a new one.
     * You can then subscribe functions to the collision's events. Note: Order of obj1 and obj2 matters.
     * If one exists already, reversing the the order will result in another collision created.
     * @param obj1 The first object or array of objects in the collision signature
     * @param obj2 The second object or array of objects in the collision signature
     */
    set<O1 extends ICollidable, O2 extends ICollidable>(obj1: O1 | O1[], obj2: O2 | O2[]): Collision<O1, O2> {
        let coll = this.get(obj1, obj2);
        if (coll) {
            return coll;
        } else {
            coll = new Collision(obj1, obj2);
            this.collisions.add(coll);
            return coll;
        }
    }

    remove<O1 extends ICollidable, O2 extends ICollidable>(obj1: O1 | O1[], obj2: O2 | O2[]) {
        let coll = this.get(obj1, obj2);
        if (coll) {
            this.collisions.remove(coll);
        }
    }

    private get<O1 extends ICollidable, O2 extends ICollidable>(obj1: O1 | O1[], obj2: O2 | O2[]): Collision<O1, O2> | null {
        let colls = this.collisions.getAll();
        colls.forEach((coll) => {
            if (Object.is(obj1, coll.obj1) && Object.is(obj2, coll.obj2)) {
                return coll;
            }
        });
        return null;
    }	
}