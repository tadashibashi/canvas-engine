import { IAnimation } from "./types";
import { Atlas } from ".";

export interface AnimationFromAtlasConfig {
  key: string;
  frameKeys: string[] | string;
  atlas: Atlas;
  baseFps: number;
  reel?: number[];
}

export class AnimationManager {
  private anims = new Map<string, IAnimation>();

  constructor() {
    
  }

  get(key: string) {
    const anim = this.anims.get(key);
    if (anim) {
      return anim;
    } else {
      throw new Error('Animation of key "' + key + '", does not exist in the AnimationManager!');
    }
  }

  createFromAtlas(config: AnimationFromAtlasConfig) {
    const anim = config.atlas.makeAnimation(config.key, config.baseFps, config.frameKeys, config.reel);
    this.anims.set(anim.key, anim);
  }

  // animation manager can store anims, create anims from atlas
  makeFrameKeys(baseName: string, separator: string, start: number, end: number, zeroPadDigits = 0): string[] {
    const frameKeys: string[] = [];
    for(let i = start; i <= end; i++) {
      frameKeys.push(baseName + separator + this.zeroPadNumber(i, zeroPadDigits));
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
}