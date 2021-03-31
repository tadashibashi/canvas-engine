import { GraphicRenderer } from "../GraphicRenderer";
import { IAnimation } from "../types";
import { Delegate } from "../../utility/Delegate";
import { GameTime } from "../../GameTime";
import { Mathf } from "../../math/functions";
import { Drawf } from "../functions";

export class AnimationRenderer extends GraphicRenderer {
  anim: IAnimation | null = null;
  speed = 1;
  index = 0;
  pixelRendering = true;
  onAnimationEnd = new Delegate<(animKey: string) => void>();
  constructor(anim?: IAnimation) {
    super();
    if (anim) {
      this.anim = anim;
      this.setAnchor(0, 0);
    }
  }

  update(gameTime: GameTime) {

  }

  draw() {
    const anim = this.anim;
    if (anim) {
      if (anim.frames.length > 1) {
        this.index = Mathf.wrap(this.index + this.speed, 0, anim.reel.length);
      } else {
        this.index = 0;
      }

      const frame = anim.frames[anim.reel[Math.floor(this.index)]];
      this.start();
      Drawf.frame(this.canvas.pixelCtx, frame, anim.image, Math.floor(-this.anchor.x), Math.floor(-this.anchor.y));
      this.end();
    }
  }
}