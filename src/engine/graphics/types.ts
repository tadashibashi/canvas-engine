/**
 * Interface for each frame in an exported TexturePacker json
 */
export interface TexturePackerFrame {
  /**
   * The original file that was packed into the Atlas
   */
  filename: string;
  /**
   * The position on the Atlas to find this texture
   */
  frame: {x: number, y: number, w: number, h: number};
  /**
   * Whether or not the image was rotated 90 degrees
   */
  rotated: boolean;
  /**
   * Whether or not the image was cut down
   */
  trimmed: boolean;
  /**
   * The offset relative to the original image, and the new width and height
   */
  spriteSourceSize: {x: number, y: number, w: number, h: number};
  /**
   * The original file's width and height
   */
  sourceSize: {w: number, h: number};
  /**
   * The pivot point in scale (0-1) to the sourceSize (original file w/h)
   */
  pivot: {x: number, y: number};
}

/**
 * Top-level exported TexturePacker json
 */
export interface TexturePackerJSON {
  frames: TexturePackerFrame[];
  meta: {
    /**
     * Website url of TexturePacker
     */
    app: string;
    version: string;
    /**
     * The full image file name of the atlas image file
     */
    image: string;
    format: string;
    /**
     * The full width and height of the atlas
     */
    size: {w: number, h: number};
    /**
     * The number of the scale (in string form)
     */
    scale: string;
    smartupdate: string;
  }
}

/**
 * Interface for a frame of an animation
 */
export interface IFrame {
  rect: {x: number, y: number, width: number, height: number };
  anchor: {x: number, y: number};
  rotated: boolean;
}

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