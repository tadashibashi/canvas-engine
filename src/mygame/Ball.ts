import { StateMachine } from "../engine/states/StateMachine";
import { Player } from "./Player";
import { Circle } from "../engine/math/shapes/Circle";
import { Mathf } from "../engine/math/functions";
import { Input, PointerCodes } from "../engine/input/types";
import { Tween } from "../engine/tweens/Tween";
import { TweenFunctions } from "../engine/tweens/functions";
import { FMODEngine } from "../engine/audio/fmodstudio/FMODEngine";
import { Brick } from "./Brick";
import { GameActor } from "../engine/gameobjects/GameActor";
import { IAnimation } from "../engine/graphics/types";
import { GameTime } from "../engine/GameTime";
import { AnimationRenderer } from "../engine/graphics/AnimationRenderer";

export class Ball extends GameActor<Circle> {
  static instance: Ball;
  states: StateMachine<'Play' | 'Out' | 'Restore' | 'Start'>;
  vspeed = 0;
  hspeed = 0;
  speed = 100;
  leftClick: Input = { axis: 0, code: 0, lastAxis: 0 };
  tweenBox = new Map<'vBounce' | 'hBounce', Tween>();
  guyAnim!: IAnimation;
  hitAnim!: IAnimation;
  persistent = true;
  constructor(x: number, y: number) {
    super(new Circle(x,y,8), 'ball');
    this.components
    .add(this.states = new StateMachine(this));
  }

  update(gameTime: GameTime) {
    super.update(gameTime);
  }

  create() {
    const tweener = this.scene.tweener;
    const input = this.scene.input;
    const player = this.manager.getByTag('player')[0] as Player;
    const colls = this.scene.collisions;
    let pos = this.transform.getPosition(true);
    // set animation
    const anims = this.scene.anims;
    this.guyAnim = anims.get('guy');
    this.hitAnim = anims.get('guyShocked');
    this.image.anim = this.guyAnim;
    this.image.speed = .1;

    // Cached input
    this.leftClick = input.pointer.add(PointerCodes.LEFT);

    // Set tweens
    this.tweenBox.set('hBounce', tweener.make(this.image.scale, ['x', 'y'], [.5, 1.5], .1, TweenFunctions.easeOutQuad)
    .setYoyo(true));
    this.tweenBox.set('vBounce', tweener.make(this.image.scale, ['y', 'x'], [.5, 1.5], .1, TweenFunctions.easeOutQuad)
    .setYoyo(true));

    // // Collisions
    // colls.set(player, this)
    // .on('enter', (p, b) => {
    //   if (b.states.currentKey === 'Play' && b.states.timeInState > .5) {
    //     b.vspeed *= -1;
    //     b.hspeed = (b.collider.x - p.collider.x)*6;
    //     fmod.playOneShot('event:/Bounce')
    //     .setParameter('Material', Mathf.choose(0, 1, 2));
    //   }
    // }, this);
  

    // States
    // === START ===
    this.states.add('Start')
    .on('update', () => {
      if (player) {
        let startx = player.transform.position.x;
        let starty = player.transform.position.y - this.collider.shape.radius;
        this.transform.setPosition(startx, starty);
      }

        if (this.leftClick.axis === 1) {
          this.states.start('Play');
        }
    });

    // === OUT ===
    this.states.add('Out')
    .on('enter', () => {
      this.image.anim = this.hitAnim;
      this.setFacing();
      tweener.fire(this.tweenBox.get('vBounce')!, true);
    })
    .on('update', (gt, sec) => {
      if (sec > 1.5) {
        this.states.start('Start');
      }
    }, this)
    .on('exit', () => {
      this.image.anim = this.guyAnim;
    });

    // === PLAY ===
    this.states.add('Play')
    .on('enter', () => {
      this.vspeed = -this.speed;
      this.hspeed = this.speed * Mathf.choose(-1, 1);
    })
    .on('update', (gameTime, sec) => {
      // Hitting left or right
      if (pos.x >= this.canvas.virtualWidth - this.collider.width/2 || pos.x <= this.collider.width/2) {
        this.bounce(true);
      } 
      // Hitting top or bottom
      if (pos.y <= this.collider.width/2) {
        this.bounce(false);
      }

      if (pos.y >= this.canvas.virtualHeight - this.collider.width/2) {
        //this.states.start('Out');
        this.bounce(false);
      }
     
      // Move Ball
      this.transform.setPosition(pos.x + this.hspeed*gameTime.deltaSec, pos.y + this.vspeed*gameTime.deltaSec);

      // Restrict ball movement
      pos.x = Mathf.clamp(pos.x, this.collider.width/2, this.canvas.virtualWidth - this.collider.width/2);
      pos.y = Mathf.clamp(pos.y, this.collider.width/2, this.canvas.virtualHeight - this.collider.width/2);
      this.setFacing();
    }, this);

    this.states.start('Start');
    
    super.create();
  }

  private setFacing() {
    if (Math.sign(this.image.scale.x) !== Math.sign(this.hspeed)) {this.image.scale.x *= -1};
  }

  bounce(horizontal: boolean) {
    const tweener = this.scene.tweener;
    const fmod = this.services.get(FMODEngine);
    if (horizontal) {
      this.hspeed *= -1;
      let t = this.tweenBox.get('hBounce');
      if (t) {
        tweener.fire(t, true);
      }
    } else {
      this.vspeed *= -1;
      let t = this.tweenBox.get('vBounce');
      if (t) {
        tweener.fire(t, true);
      }
    }

    // const inst = fmod.playOneShot('event:/Bounce',
    //   {name: 'Material', value: Mathf.choose(0, 1,2)},
    //   {name: 'PositionX', value: this.transform.getPosition().x/this.canvas.virtualWidth}
    // );
    this.scene.tweener.tweenTo({val: 0}, 'val', 2, .1, TweenFunctions.linear)
    .onStep((time, val, rep) => {
      //inst.setPitch(val);
    });
  }

  destroy() {
    super.destroy();
  }
}