import { Component } from "../../Component";
import { Collision } from "./Collision";
import { GameTime } from "../../GameTime";
import { Collisionf } from "./functions";
import { ICollidable } from "./types";

export class CollisionManager extends Component {
    private collisions: Collision[] = [];
    constructor() {
        super(null, 100); // <- update order delayed so that movement calculations come before
    }
    
    update(gameTime: GameTime) {
        // Check all collisions
        let colls = this.collisions;
        for(let i = 0; i < colls.length; i++) {
            let coll = colls[i];
            coll.lastCollide = coll.didCollide;
            coll.didCollide = Collisionf.checkCollision(coll);

            // process events
            if (coll.didCollide) {
                if (!coll.lastCollide) {
                    coll.events.send('enter', coll.obj1, coll.obj2);
                }
                coll.events.send('collide', coll.obj1, coll.obj2);
            } else {
                if (coll.lastCollide) {
                    coll.events.send('exit', coll.obj1, coll.obj2);
                }
            }
        }
    }

    add(obj1: ICollidable | ICollidable[], obj2: ICollidable | ICollidable[]): Collision {
        const coll = new Collision(obj1, obj2);
        this.collisions.push(coll);
        return coll;
    }

    get(obj1: ICollidable | ICollidable[], obj2: ICollidable | ICollidable[]): Collision {
        let colls = this.collisions;
        colls.forEach((coll) => {
            if (Object.is(obj1, coll.obj1) && Object.is(obj2, coll.obj2)) {
                return coll;
            }
        });
        throw new Error('CollisionManager does not contain a collision with the requested collision signature!');
    }

	
}