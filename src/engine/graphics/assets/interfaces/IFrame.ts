/**
 * Interface for a frame of an animation
 */
export interface IFrame {
  rect: {x: number, y: number, width: number, height: number };
  anchor: {x: number, y: number};
  rotated: boolean;
}