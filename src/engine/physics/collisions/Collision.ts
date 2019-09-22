import { ICollidable } from "./types";
import { DelegateGroup } from "../../utility/DelegateGroup";
import { Collisionf } from "./functions";
import { Component } from "../../Component";

export class Collision<O1 extends ICollidable, O2 extends ICollidable> extends Component {
    readonly obj1: O1 | O1[];
    readonly obj2: O2 | O2[];
    private events = new DelegateGroup<'enter' | 'exit' | 'collide', (obj1: O1, obj2: O2) => void>('enter', 'exit', 'collide');

    private lastColls: [O1, O2][] = [];
    private colls: [O1, O2][] = [];

    on(event: 'enter' | 'exit' | 'collide', callback: (obj1: O1, obj2: O2) => void, context?: any) {
        this.events.on(event, callback, context);
        return this;
    }
    off(event: 'enter' | 'exit' | 'collide', callback: (obj1: O1, obj2: O2) => void) {
        this.events.off(event, callback);
        return this;
    }

    /** Notifies this Collision that a particular collision within its signature has occured */
    collided(o1: O1, o2: O2) {
        const coll: [O1, O2] = [o1, o2];
        if (!this.collArrayHasColl(this.lastColls, coll)) {
            this.events.send('enter', o1, o2);
            if (this.isDebug) console.log('Sending ENTER!');
        }
        this.colls.push(coll);
    }

    private areCollsEqual(coll1: [O1,O2], coll2: [O1, O2]) {
        const check = (coll1[0] === coll2[0]) && (coll1[1] === coll2[1]);
        return (check);
    }
    private collArrayHasColl(collArray: [O1, O2][], collToCheck: [O1,O2]) {
        for (let i = 0; i < collArray.length; i++) {
            let coll = collArray[i];
            if (this.areCollsEqual(coll, collToCheck)) {
                return true;
            }
        }
        return false;
    }

    // Make sure this happens at the very end of game updating after checking for collisions
    update() {
        Collisionf.checkCollision(this, true);

        const colls = this.colls;
        colls.forEach((coll) => {
            this.events.send('collide', coll[0], coll[1]);
            if (this.isDebug) console.log('Colliding!', coll[0], coll[1]);
        });
        // CHECKING FOR EXIT (this means that lastColls has something that colls does not)
        // Compare arrays
        
        // later after testing, put a conditional if the delegate length is larger than 0. If no one's listening then don't check
        const lastColls = this.lastColls;
        for (let i = 0; i < lastColls.length; i++) {
            const lastColl = lastColls[i];
            if (!this.collArrayHasColl(colls, lastColl)) {
                this.events.send('exit', lastColl[0], lastColl[1]);
                if (this.isDebug) console.log('Sending EXIT!', lastColl[0], lastColl[1]);
            }
        }
        this.lastColls = this.colls;
        this.colls = [];
    }

    constructor(obj1: O1 | O1[], obj2: O2 | O2[], tag?: string) {
        super(tag);
        this.obj1 = obj1;
        this.obj2 = obj2;
    }
}