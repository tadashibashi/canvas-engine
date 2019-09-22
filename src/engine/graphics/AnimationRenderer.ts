import { GraphicRenderer } from "./GraphicRenderer";
import { GameTime } from "../GameTime";
import { Mathf } from "../math/functions";
import { Drawf } from "./functions";
import { IAnimation } from "./types";

export class AnimationRenderer extends GraphicRenderer {
  anim: IAnimation | null = null;
  speed = 1;
  index = 0;
  pixelRendering = true;
  constructor(anim?: IAnimation) {
    super();
    if (anim) {
      this.anim = anim;
      this.setAnchor(0, 0);
    }
  }

  update(gameTime: GameTime) {
    const anim = this.anim;
    if (anim && anim.frames.length > 1) {
      this.index = Mathf.wrap(this.index + this.speed, 0, anim.frames.length);
    } else {
      this.index = 0;
    }
  }

  draw() {
    if (this.anim) {
      const frame = this.anim.frames[Math.floor(this.index)];
      this.start();
      Drawf.frame(this.canvas.pixelCtx, frame, this.anim.image, -this.anchor.x, -this.anchor.y);
      this.end();
    }
  }
}