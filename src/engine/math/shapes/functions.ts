import { Mathf } from "../functions";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Point } from "./Point";

export function isCircCircOverlapping(coll1: Circle, coll2: Circle): boolean {
  // Get the difference in x and y coordinates between circle centers
  let diffX = (coll1.x - coll1.anchor.x) - (coll2.x - coll2.anchor.x);
  let diffY = (coll1.y - coll1.anchor.y) - (coll2.y - coll2.anchor.y);
  // Find distance between the two centers (hypoteneuse)
  let dist = Math.sqrt((diffX * diffX) + (diffY * diffY));
  return (dist <= coll1.radius + coll2.radius);
}

export function isRectCircOverlapping(rectColl: Rectangle, circColl: Circle): boolean {
  let cx = circColl.x - circColl.anchor.x;
  let cy = circColl.y - circColl.anchor.y;

  // find closest side
  if (cx < rectColl.left) cx = rectColl.left;
  else if (cx > rectColl.right) cx = rectColl.right;
  if (cy < rectColl.top) cy = rectColl.top;
  else if (cy > rectColl.bottom) cy = rectColl.bottom;

  let diffX = circColl.x - circColl.anchor.x - cx;
  let diffY = circColl.y - circColl.anchor.y - cy;
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