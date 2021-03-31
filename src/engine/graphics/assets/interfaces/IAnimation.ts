import { IFrame } from "./IFrame";

/**
 * Interface for an animation
 */
export interface IAnimation {
  key: string;
  image: HTMLImageElement;
  frames: IFrame[];
  reel: number[];
  baseFps: number;
}