import { Mathf } from "../../core/Mathf";
import { Collision } from "./Collision";
import { Shape } from "../../core/shapes/Shape";
import { Rectangle } from "../../core/shapes/Rectangle";
import { Circle } from "../../core/shapes/Circle";
import { Point } from "../../core/shapes/Point";
import { ICollidable } from "../../core/Interfaces";

export namespace Collisionf {
    /**
     * Handles processing a Collision object, where either inner object can be an array of objects containing Shape colliders
     * @param coll The Collision object to process
     */
    export function checkCollision(coll: Collision): boolean {
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
                        if (areShapesOverlapping(obj1[i].collider, obj2[j].collider)) {
                            collided = true;
                        }
                    }
                }
            } else {
                // Only obj1 is an array
                // for loop over obj1's collider
                for (let i = 0; i < obj1.length; i++) {
                    // check collisions
                    if (areShapesOverlapping(obj1[i].collider, obj2.collider)) {
                        collided = true;
                    }
                }
            }
        } else {
            // Only obj2 is an array
            if (Array.isArray(obj2)) {
                // for loop over obj2
                for (let j = 0; j < obj2.length; j++) {
                    if (areShapesOverlapping(obj1.collider, obj2[j].collider)) {
                        collided = true;
                    }
                }
            } else {
                // None are arrays, both are individual objects
                if (areShapesOverlapping(obj1.collider, obj2.collider)) {
                    collided = true;
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
    export function checkAgainstCollideables(_this: ICollidable, offset: {x?:number, y?:number, z?:number} | null, collidables: ICollidable[], callback?: (collidable: ICollidable)=>void) {
        const myColl = _this.collider;
        if (offset) {
            myColl.setPosition(myColl.x + (offset.x || 0), myColl.y + (offset.y || 0), myColl.x + (offset.z || 0)); // set offset
        }
        
        const colls = collidables;
        let didCollide = false;
        for (let i = 0; i < colls.length; i++) {
            let coll = colls[i];
            if (areShapesOverlapping(myColl, coll.collider)) {
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

    export function isCircCircOverlapping(coll1: Circle, coll2: Circle): boolean {
        // Get the difference in x and y coordinates between circle centers
        let diffX = coll1.x - coll2.x;
        let diffY = coll1.y - coll2.y;
        // Find distance between the two centers (hypoteneuse)
        let dist = Math.sqrt((diffX * diffX) + (diffY * diffY));
        return (dist <= coll1.radius + coll2.radius);
    }

    export function isRectCircOverlapping(rectColl: Rectangle, circColl: Circle): boolean {
        let cx = circColl.x;
        let cy = circColl.y;
        // find closest side
        if (cx < rectColl.x) cx = rectColl.x;
        else if (cx > rectColl.x + rectColl.width) cx = rectColl.x + rectColl.width;
        if (cy < rectColl.y) cy = rectColl.y;
        else if (cy > rectColl.y + rectColl.height) cy = rectColl.y + rectColl.height;

        let diffX = circColl.x - cx;
        let diffY = circColl.y - cy;
        let diff = Math.sqrt((diffX * diffX) + (diffY * diffY));
        return (diff <= circColl.radius);
    }

    export function isPointInsideRect(point: Point, rect: Rectangle): boolean {
        return (point.x - point.anchor.x >= rect.left && point.x - point.anchor.x < rect.right && point.y - point.anchor.y >= rect.top && point.y - point.anchor.y < rect.bottom);
    }

    export function isPointInsideCirc(point: Point, circ: Circle) {
        return Mathf.pointDistance(point.x - point.anchor.x, point.y - point.anchor.y, circ.x - circ.anchor.x, circ.y - circ.anchor.y) <= circ.radius;
    }

    export function isRectRectOverlapping(rect1: Rectangle, rect2: Rectangle) {
        if (Math.abs(rect1.left - rect2.left) > rect2.width || Math.abs(rect1.top - rect2.top) > rect2.height) return false;
        return (
            isPointInsideRect(new Point(rect1.left, rect1.top), rect2) ||
            isPointInsideRect(new Point(rect1.left, rect1.bottom - 1), rect2) ||
            isPointInsideRect(new Point(rect1.right - 1, rect1.top), rect2) ||
            isPointInsideRect(new Point(rect1.right - 1, rect1.bottom - 1), rect2)
        );
    }
}