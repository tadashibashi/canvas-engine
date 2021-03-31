import { DrawableComponent } from "../DrawableComponent";
import { InputManager } from "../input/InputManager";
import { ComponentManager } from "../ComponentManager";
import { GameObject } from "../gameobjects/GameObject";
import { GameTime } from "../GameTime";
import { AtlasManager } from "../graphics/AtlasManager";
import { Game } from "../Game";
import { AnimationManager } from "../graphics/AnimationManager";
import { Tweener } from "../tweens/Tweener";
import { AssetBank } from "../assets/AssetBank";
import { Camera } from "../Camera";
import { AssetLoadManager } from "../assets/loading/AssetLoadManager";
import { Ball } from "../../mygame/Ball";
import { CollisionManager } from "../physics/collisions/CollisionManager";
import { Player } from "../../mygame/Player";
import { Brick } from "../../mygame/Brick";
import { DelegateGroup } from "../utility/DelegateGroup";
import { Drawf } from "../graphics/functions";
import { SceneManager } from "./SceneManager";
import { Mathf } from "../math/functions";

export class Scene extends DrawableComponent {
  loaded = false;
  active = false;
  // ==== Reference obtained during awake() ====
  atlas!: AtlasManager;
  anims!: AnimationManager;
  assets!: AssetBank;
  game!: Game;

  // === Scene-Level Objects ===
  private gameobjects!: ComponentManager<GameObject>;
  persistent!: GameObject[];
  camera = new Camera(0, 0, 0);
  
  // Components
  components!: ComponentManager;
  collisions!: CollisionManager;
  tweener!: Tweener;
  input!: InputManager;
  scenes!: SceneManager;
  load: AssetLoadManager;

  events = new DelegateGroup<'create' | 'end' | 'pause' | 'resume', (scene: Scene)=>void>('create', 'end', 'pause', 'resume');
  constructor(public readonly key: string, levelDataJSONKey: string, public backgroundColor: string | CanvasGradient = 'black', tag?: string) {
    super(tag);
    this.load = new AssetLoadManager('public/', this.services.get(AssetBank));
    this.load.onLoadFinish.subscribe(this.preCreate);
    this.gameobjects = new ComponentManager<GameObject>();
    this.gameobjects.onAdded.subscribe((go) => {
      go.scene = this;
    });
  }
  
  start() {
    // Setting all references from other places here. Call start at a safe time to connect these dependencies
    this.canvas.backgroundCtx.fillStyle = this.backgroundColor;
    this.canvas.backgroundCtx.fillRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
    this.game = Game.engine;
    this.atlas = this.services.get(AtlasManager);
    this.anims = this.services.get(AnimationManager);
    this.scenes = this.services.get(SceneManager);
    this.input = this.services.get(InputManager);
    this.persistent = this.scenes.persistent;


    this.components = new ComponentManager()
    .add(this.tweener = new Tweener())
    .add(this.collisions = new CollisionManager());

    this.preload();
    this.load.load();
  }

  end = () => {
    this.loaded = false; // turn off loading flag
    this.components.destroy();
    this.gameobjects.forEach((gameObject) => {
      this.remove(gameObject);
    });
    
  }

  resume() {
    if (this.loaded && !this.active) {
      this.active = true;
      this.events.send('resume', this);
    }
  }

  pause() {
    if (this.loaded && this.active) {
      this.active = false;
      this.events.send('pause', this);
    }
    
  }
  // =============== EVENTS ================ //
  /**
   * Load all raw assets here via this.assets
   */
  preload() {  }

  private preCreate = () => {
    
    
    this.create();
    this.gameobjects.forEach((go) => {
      if (!go.wasCreated) go.create();
    });
    this.events.send('create', this);
    this.loaded = true; 
    this.active = true;
  }

  /**
   * 
   */
  create() {  
    this.add(new Player(this.canvas.virtualWidth/2, this.canvas.virtualHeight - 10, 64, 16));
    if (!Ball.instance) {
      this.add(Ball.instance = new Ball(this.canvas.virtualWidth/2, this.canvas.virtualHeight - 32));
    } 

    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        this.add(new Brick(i * 64, j*16 + 1));
      }
    }

    this.collisions.set(this.gameobjects.getByTag('ball') as Ball[], this.gameobjects.getByTag('brick') as Brick[])
    .on('enter', (ball, brick) => {
      const pos = ball.transform.getLastPosition(false);
      const brickRect = brick.collider.shape;
      if (pos.x < brickRect.left || pos.x > brickRect.right) {
        ball.bounce(true);
      }
      if (pos.y < brickRect.top || pos.y > brickRect.bottom) {
        ball.bounce(false);
      }
      if (brick instanceof Brick) brick.destroy();
    });

    this.collisions.set(this.gameobjects.getByTag('ball') as Ball[], this.gameobjects.getByTag('ball') as Ball[])
    .on('enter', (thisBall, otherBall) => {
      const pos = thisBall.transform.getLastPosition(false);
      const otherColl = otherBall.collider.shape;
      if (otherBall !== thisBall) {
        if (pos.x < otherColl.left || pos.x > otherColl.right) {
          thisBall.bounce(true);
        }
        if (pos.y < otherColl.top || pos.y > otherColl.bottom) {
          thisBall.bounce(false);
        }
        if (pos.x >= otherColl.left && pos.y <= otherColl.right && pos.y >= otherColl.top && pos.y <= otherColl.bottom) {
          thisBall.bounce(Mathf.choose(true, false));
        }
      }

    });
  }
  /**
   * SceneManager should update this. Not to be overriden, use Update instead.
   * @param gameTime 
   */
  preUpdate(gameTime: GameTime) {
    if (!this.loaded && !this.active) return;
    this.components.update(gameTime);
    this.gameobjects.forEach((go) => {
      if (go.scene.key === this.key) {
        go.update(gameTime);
      }
    });
    this.update(gameTime);
  }

  /**
   * Overwrite for your own updating. No need to make super calls.
   * @param gameTime 
   */
  update(gameTime: GameTime) {}

  /**
   * SceneManager calls this, not to be overriden, use draw instead.
   * If managing Scene yourself, call this and not draw. preDraw will execute draw at the end of the function.
   * @param gameTime 
   */
  preDraw(gameTime: GameTime) {
    if (!this.loaded) return; // will still draw if paused

    this.canvas.pixelCtx.resetTransform();    
    this.canvas.guiCtx.clearRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
    this.canvas.pixelCtx.clearRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
    this.canvas.pixelCtx.translate(Math.floor(-this.camera.position.x), Math.floor(-this.camera.position.y));
    this.gameobjects.forEach((go) => {
      if (go.scene.key === this.key) {
        go.draw(gameTime);
      }
    })
    this.draw(gameTime);
  }
  /**
   * Overwrite for own drawing. No need to make super calls.
   * @param gameTime 
   */
  draw(gameTime: GameTime) {
    Drawf.text(this.canvas.guiCtx, {
      fillStyle: 'white', 
      fontFamily: 'charybdis', 
      text: Math.round(this.input.pointer.position.x) + ', ' + Math.round(this.input.pointer.position.y), 
      fontSize: Math.floor(12), 
      position: {x: Math.round(this.input.pointer.position.x), y: Math.round(this.input.pointer.position.y)}
  });
  }

  // ========  Game Object Management ===========
  add(gameObject: GameObject) {
    if (gameObject.persistent) {
      this.makePersistent(gameObject);
    }
    this.gameobjects.add(gameObject);
    if (this.loaded) { // fire object create if already loaded
      gameObject.create();
    }
    return this;
  }
  remove(gameObject: GameObject) {
    this.gameobjects.remove(gameObject);
    return this;
  }

  /** 
   * Makes an object persistent, to be used after it has been added.
   * Otherwise if persistent is set to true in GameObject on add, it will automatically
   * be made persistent in Scene.
   */
  makePersistent(gameObject: GameObject) {
    const index = this.persistent.indexOf(gameObject);
    if (index === -1) {
      gameObject.persistent = true;
      this.persistent.push(gameObject);
    } else {
      if (this.isDebug) console.log('Warning! GameObject is already counted as persistent by the SceneManager!');
    }
  }
  removePersistence(gameObject: GameObject) {
    const index = this.persistent.indexOf(gameObject);
    if (index !== -1) {
      gameObject.persistent = false;
      this.persistent.splice(index, 1);
    } else {
      if (this.isDebug) console.log('Warning! GameObject is not counted as persistent by the SceneManager and cannot be removed as persistent!');
    }
  }

}