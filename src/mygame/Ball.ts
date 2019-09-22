import { StateMachine } from "../engine/states/StateMachine";
import { GameTime } from "../engine/GameTime";
import { GameObject } from "../engine/GameObject";
import { InputManager } from "../engine/input/InputManager";
import { Player } from "./Player";
import { Drawf } from "../engine/graphics/functions";
import { Circle } from "../engine/math/shapes/Circle";
import { Mathf } from "../engine/math/functions";
import { Input, PointerCodes } from "../engine/input/types";
import { Tweener } from "../engine/tweens/Tweener";
import { Tween } from "../engine/tweens/Tween";
import { TweenFunctions } from "../engine/tweens/functions";
import { FMODEngine } from "../engine/audio/fmodstudio/FMODEngine";
import { CollisionManager } from "../engine/physics/collisions/CollisionManager";
import { Collider } from "../engine/physics/collisions/Collider";
import { AnimationRenderer } from "../engine/graphics/AnimationRenderer";
import { Atlas } from "../engine/graphics/Atlas";
import { Debug } from "../engine/Debug";
import { Brick } from "./Brick";

export class Ball extends GameObject {
  states: StateMachine<'Play' | 'Out' | 'Restore' | 'Start'>;
  ar: AnimationRenderer;
  collider: Collider<Circle>;
  vspeed = 0;
  hspeed = 0;
  speed = 150;
  leftClick: Input = { axis: 0, code: 0, lastAxis: 0 };
  tweenBox = new Map<'vBounce' | 'hBounce', Tween>();
  constructor(x: number, y: number, radius: number) {
    super('ball', {x: x, y: y});
    this.collider = new Collider(new Circle(x, y, radius));

    this.components
    .add(this.states = new StateMachine(this))
    .add(this.ar = new AnimationRenderer());

  }

  awake() {
    super.awake();
    this.collider.syncToTransform(this.transform);
    const tweener = this.services.get(Tweener);
    const input = this.services.get(InputManager);
    const player = this.manager.getByTag('player')[0] as Player;
    const colls = this.services.get(CollisionManager);
    let pos = this.transform.getPosition(true);
    const fmod = this.services.get(FMODEngine);
    const atlas = this.services.get(Atlas);
    // set animation
    const compyAnim = atlas.makeAnimation(10, atlas.makeFrameKeys('creatures/guy/', '', 1, 4));
    this.ar.anim = compyAnim;
    this.ar.speed = .1;


    // Cached input
    this.leftClick = input.pointer.add(PointerCodes.LEFT);

    // Set tweens
    this.tweenBox.set('hBounce', tweener.make(this.ar.scale, ['x', 'y'], [.5, 1.5], .1, TweenFunctions.easeOutQuad)
    .setYoyo(true));
    this.tweenBox.set('vBounce', tweener.make(this.ar.scale, ['y', 'x'], [.5, 1.5], .1, TweenFunctions.easeOutQuad)
    .setYoyo(true));

    // Collisions
    colls.set(player, this)
    .events.on('enter', (p, b) => {
      if (b.states.currentKey === 'Play' && b.states.timeInState > .5) {
        b.vspeed *= -1;
        b.hspeed = (b.collider.x - p.collider.x)*6;
        fmod.playOneShot('event:/Bounce')
        .setParameter('Material', Mathf.choose(0, 1, 2));
      }
    }, this);

    let bricks = this.manager.getByTag('brick') as Brick[];

    colls.set(this, bricks)
    .events.on('enter', (me, brick) => {
      const pos = me.transform.getLastPosition(false);
      const brickRect = brick.collider.shape;
      if (pos.x < brickRect.left || pos.x > brickRect.right) {
        this.bounce(true);
      }
      if (pos.y < brickRect.top || pos.y > brickRect.bottom) {
        this.bounce(false);
      }
      brick.destroy();
    }, this);

    // States
    // === START ===
    this.states.add('Start')
    .on('update', () => {
      if (player) {
        // let startx = player.transform.position.x;
        // let starty = player.transform.position.y - this.collider.shape.radius;
        let startx = input.pointer.position.x;
        let starty = input.pointer.position.y;
        this.transform.setPosition(startx, starty);
      }

        if (this.leftClick.axis === 1) {
          console.log('Clicked! Entering Play Mode');
          this.states.start('Play');
          Debug.log('hello from', this);
        }
    }, this);

    // === OUT ===
    this.states.add('Out')
    .on('update', (gt, sec) => {
      if (sec > 1.5) {
        this.states.start('Start');
      }
    }, this);

    // === PLAY ===
    this.states.add('Play')
    .on('enter', () => {
      this.vspeed = -this.speed;
      this.hspeed = this.speed * Mathf.choose(-1, 1);
    }, this)
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
        this.states.start('Out');
      }
     
      // Move Ball
      this.transform.setPosition(pos.x + this.hspeed*gameTime.deltaSec, pos.y + this.vspeed*gameTime.deltaSec);

      // Restrict ball movement
      pos.x = Mathf.clamp(pos.x, this.collider.width/2, this.canvas.virtualWidth - this.collider.width/2);
      pos.y = Mathf.clamp(pos.y, this.collider.width/2, this.canvas.virtualHeight - this.collider.width/2);

      if (Math.sign(this.ar.scale.x) !== Math.sign(this.hspeed)) {this.ar.scale.x *= -1};
    }, this);

    this.states.start('Start');
  }

  update(gameTime: GameTime) {
    super.update(gameTime);
    
  }

  draw(gameTime: GameTime) {
    super.draw(gameTime);
    // this.ar.start();
    // Drawf.circle(this.canvas.context, 'green', -this.collider.anchor.x, -this.collider.anchor.y, this.collider.width/2);
    // this.ar.end();
  }
  bounce(horizontal: boolean) {
    const tweener = this.services.get(Tweener);
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
    fmod.playOneShot('event:/Bounce')
    .setParameter('Material', Mathf.choose(0, 1, 2));
  }

  destroy() {
    super.destroy();
  }
}