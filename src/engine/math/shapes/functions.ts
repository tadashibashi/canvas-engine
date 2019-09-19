import { Mathf } from "../functions";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Point } from "./Point";

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