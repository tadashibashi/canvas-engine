import { IFrame, TexturePackerJSON, TexturePackerFrame, IAnimation } from "./interfaces";

export class Atlas {
  readonly filename: string;
  readonly image: HTMLImageElement;
  readonly size: { w: number, h: number };
  readonly scale: number;
  readonly frames = new Map<string, IFrame>();
  constructor(image: HTMLImageElement, config: TexturePackerJSON) {
    this.size = config.meta.size;
    this.scale = parseInt(config.meta.scale, 10);
    this.image = image;
    this.filename = config.meta.image;
    config.frames.forEach((frame) => {
      this.frames.set(frame.filename, this.makeFrame(frame));
    });
    Object.seal(this.frames);
  }
  private makeFrame(config: TexturePackerFrame) {
    return {
      rect: {
        x: config.frame.x, y: config.frame.y, 
        width: config.frame.w, height: config.frame.h
      },
      anchor: {
        x: Math.round(config.sourceSize.w * config.pivot.x) - config.spriteSourceSize.x,
        y: Math.round(config.sourceSize.h * config.pivot.y) - config.spriteSourceSize.y
      },
      rotated: config.rotated
    } as IFrame;
  }


  /**
   * Make an animation that uses either frame order or a reel to determine animation
   * order. If you pass a reel (number[]), then it will use that reel, otherwise if you
   * leave reel blank or pass an empty array, it will default to frame order.
   * @param frameKeys the frames to render
   * @param reel optional reel to set a different frame order
   */
  makeAnimation(key: string, fps: number, frameKeys: string[] | string, reel?: number[]): IAnimation {
    let frames: IFrame[];
    if (Array.isArray(frameKeys)) {
      frames = this.getFrames(frameKeys);
    } else {
      frames = [this.getFrame(frameKeys)];
    }
    
    if (!reel) {
      reel = [];
      for (let i = 0; i < frameKeys.length; i++) {
        reel.push(i);
      }
    }
    return {
      key: key,
      image: this.image,
      frames: frames,
      reel: reel,
      baseFps: fps
    };
  }

  getFrame(key: string) {
    const frame = this.frames.get(key);
    if (frame) {
      return frame;
    } else {
      throw new Error('Frame data of key: ' + key + ', does not exist on this TextureAtlas!');
    }
  }

  getFrames(keys: string[]) {
    const frames: IFrame[] = [];
    keys.forEach((key) => {
      const frame = this.frames.get(key);
      if (frame) {
        frames.push(frame);
      } else {
        throw new Error('Frame data of key:' + key + ' does not exist on this TextureAtlas!');
      }
    });
    return frames;
  }
}