import { TexturePackerFrame, TexturePackerJSON, IFrame, IAnimation } from './types';

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
  makeFrameKeys(baseName: string, separator: string, start: number, end: number, zeroPadding = 0): string[] {
    const frameKeys: string[] = [];
    for(let i = start; i <= end; i++) {
      frameKeys.push(baseName + separator + this.zeroPadNumber(i, zeroPadding));
    }
    console.log(frameKeys);
    return frameKeys;
  }
  private zeroPadNumber(num: number, numDigits: number): string {
    numDigits = Math.floor(numDigits);
    let numStr = Math.floor(num).toString();
    let diffLength = numDigits - numStr.length;
    if (diffLength > 0) {
      for (let i = 0; i < diffLength; i++) {
        numStr = '0' + numStr;
      }
    }
    return numStr;
  }

  /**
   * Make an animation that uses either frame order or a reel to determine animation
   * order. If you pass a reel (number[]), then it will use that reel, otherwise if you
   * leave reel blank or pass an empty array, it will default to frame order.
   * @param frameKeys the frames to render
   * @param reel optional reel to set a different frame order
   */
  makeAnimation(fps: number, frameKeys: string[], reel: number[] = []): IAnimation {
    const frames = this.getFrames(frameKeys);
    let useReel = false;
    if (reel.length > 0) {
      useReel = true;
    }
    return {
      image: this.image,
      frames: frames,
      reel: reel,
      useReel: useReel,
      fps: fps
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