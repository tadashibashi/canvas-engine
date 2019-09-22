import { isRectRectOverlapping, isRectCircOverlapping, isPointInsideRect, isCircCircOverlapping, isPointInsideCirc } from "../../math/shapes/functions";
import { Collision } from "./Collision";
import { ICollidable } from "./types";
import { Shape } from "../../math/shapes/Shape";
import { Rectangle } from "../../math/shapes/Rectangle";
import { Circle } from "../../math/shapes/Circle";
import { Point } from "../../math/shapes/Point";

export namespace Collisionf {

    /**
     * Handles processing a Collision object, where either inner object can be an array of objects containing Shape colliders
     * @param coll The Collision object to process
     * @param processCollision Sets the collision's internal workings and fires the callback if set to true. Skips this if not.
     */
    export function checkCollision<O1 extends ICollidable, O2 extends ICollidable>(coll: Collision<O1, O2>, processCollCb = false): boolean {
        let obj1 = coll.obj1;
        let obj2 = coll.obj2;
        let collided = false;
        if (Array.isArray(obj1)) {
            if (Array.isArray(obj2)) {
                // Both obj1 and obj2 are arrays
                // for loop over obj1's collider
                for (let i = 0; i < obj1.length; i++) {
                    // for loop over obj2
                    for (let j = 0; j < obj2.length; j++) {
                        // check collisions with obj1/obj2
                        if (areShapesOverlapping(obj1[i].collider.shape, obj2[j].collider.shape)) {
                            collided = true;
                            if (processCollCb) coll.collided(obj1[i], obj2[j]); 
                        }
                    }
                }
            } else {
                // Only obj1 is an array
                // for loop over obj1's collider
                for (let i = 0; i < obj1.length; i++) {
                    // check collisions
                    if (areShapesOverlapping(obj1[i].collider.shape, obj2.collider.shape)) {
                        collided = true;
                        if (processCollCb) coll.collided(obj1[i], obj2); 
                    }
                }
            }
        } else {
            // Only obj2 is an array
            if (Array.isArray(obj2)) {
                // for loop over obj2
                for (let j = 0; j < obj2.length; j++) {
                    if (areShapesOverlapping(obj1.collider.shape, obj2[j].collider.shape)) {
                        collided = true;
                        if (processCollCb) coll.collided(obj1, obj2[j]); 
                    }
                }
            } else {
                // None are arrays, both are individual objects
                if (areShapesOverlapping(obj1.collider.shape, obj2.collider.shape)) {
                    collided = true;
                    if (processCollCb) coll.collided(obj1, obj2); 
                }

            }
        }
        return collided;
    }

    /**
     * 
     * @param this This collider
     * @param offset Offset from this collider to check. Set to null or {} for no offset
     * @param collidables Other collidables to check
     * @param callback Callback to fire, leave blank/undefined for just returning truth (more efficiency).
     */
    export function checkAgainstCollideables<O1 extends ICollidable, O2 extends ICollidable>(_this: O1, offset: {x?:number, y?:number, z?:number} | null, collidables: O2[], callback?: (collidable: O2)=>void) {
        const myColl = _this.collider.shape;
        if (offset) {
            myColl.setPosition(myColl.x + (offset.x || 0), myColl.y + (offset.y || 0), myColl.x + (offset.z || 0)); // set offset
        }
        
        const colls = collidables;
        let didCollide = false;
        for (let i = 0; i < colls.length; i++) {
            let coll = colls[i];
            if (areShapesOverlapping(myColl, coll.collider.shape)) {
                if (callback) {
                    callback(coll);
                    didCollide = true;
                } else {
                    // If no need for callbacks, only returning for truth
                    return true;
                }    
            }
        }
        return didCollide;
    }

    export function areShapesOverlapping(shape1: Shape, shape2: Shape): boolean {
        let conditional = false;
        if (shape1 instanceof Rectangle) {
            if (shape2 instanceof Rectangle) {
                conditional = (isRectRectOverlapping(shape1, shape2));
            }
            if (shape2 instanceof Circle) {
                conditional = (isRectCircOverlapping(shape1, shape2));
            }
            if (shape2 instanceof Point) {
                conditional = (isPointInsideRect(shape2, shape1));
            }
        } else if (shape1 instanceof Circle) {
            if (shape2 instanceof Rectangle) {
                conditional = (isRectCircOverlapping(shape2, shape1));
            }
            if (shape2 instanceof Circle) {
                conditional = (isCircCircOverlapping(shape1, shape2));
            }
            if (shape2 instanceof Point) {
                conditional = (isPointInsideCirc(shape2, shape1));
            }
        } else if (shape1 instanceof Point) {
            if (shape2 instanceof Rectangle) {
                conditional = (isPointInsideRect(shape1, shape2));
            }
            if (shape2 instanceof Circle) {
                conditional = (isPointInsideCirc(shape1, shape2));
            }
            if (shape2 instanceof Point) {
                conditional = (Math.round(shape1.x) === Math.round(shape2.x) && Math.round(shape1.y) === Math.round(shape2.y));
            }
        }
        return conditional;
    }

   
}