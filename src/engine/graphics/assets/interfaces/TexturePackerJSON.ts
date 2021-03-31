import { TexturePackerFrame } from "./TexturePackerFrame";

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
