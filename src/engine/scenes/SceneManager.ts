import { Scene } from "./Scene";
import { DrawableComponent } from "../DrawableComponent";
import { GameTime } from "../GameTime";
import { GameObject } from "../gameobjects/GameObject";
import { ComponentManager } from "../ComponentManager";
import { CollisionManager } from "../physics/collisions/CollisionManager";
import { Tweener } from "../tweens/Tweener";
import { InputManager } from "../input/InputManager";

export class SceneManager extends DrawableComponent {
  currentScenes: Scene[] = []; // can run scenes simultaneously (gui menu?)
  persistent: GameObject[] = [];
  
  private scenes = new Map<string, Scene>();
  private endQueue: Scene[] = [];
  private startQueue: Scene[] = [];

  addScene(scene: Scene) {
    if (this.scenes.has(scene.key)) {
      if (this.isDebug) console.log('Warning! The scene key, "' + scene.key + '"is already in the SceneManager! Cancelling add()');
    } else {
      this.scenes.set(scene.key, scene);
    }
  }

  update(gameTime: GameTime) {
    this.scenes.forEach((scene) => {
      scene.preUpdate(gameTime);
    });
  }
  draw(gameTime: GameTime) {
    this.currentScenes.forEach((scene) => {
      scene.preDraw(gameTime);
    });
    if (this.endQueue.length > 0) {
      this.endAllInEndQueue();
    }
    if (this.startQueue.length > 0) {
      this.startAllInStartQueue();
    }
  }

  private endAllInEndQueue() {
    while (this.endQueue.length > 0) {
      const scene = this.endQueue.shift();
      if (scene) {
        scene.end();
        const index = this.currentScenes.indexOf(scene); 
        if (index !== -1) {
          this.currentScenes.splice(index, 1);
        }
      }
    }   
  }
  // Comes after endAllInEndQueue
  private startAllInStartQueue() {
    while (this.startQueue.length > 0) {
      const scene = this.startQueue.shift();
      if (scene) {
        this.addPersistentToScene(scene);
        scene.start();
        const index = this.currentScenes.indexOf(scene); 
        if (index === -1) {
          this.currentScenes.push(scene);
        } else {
          if (this.isDebug) console.log('Internal Error! SceneManager tried to start scene, but it already exists in currentScenes!');
        }
      }
    }
    this.startQueue = [];
  }

  /**
   * Starts a Scene or resets a currently running Scene.
   * By ending other scenes optionally, the scene assumes responsibility for persistent objects
   * @param key 
   * @param endOthers 
   */
  start(key: string, endOthers = true) {
    const scene = this.getScene(key);
    if (scene) this.startByScene(scene, endOthers);
  }

  /**
   * Starts a scene anew. Will reset it if already running.
   * @param key 
   */
  private startByScene(scene: Scene, endOthers = true) {
    if (endOthers) {
      this.currentScenes.forEach((s) => {
        this.endByScene(s);
      });
    } else if (scene.loaded) { // scene has already been loaded before
      this.endByScene(scene);
    }
    this.startQueue.push(scene);
  }

  private addPersistentToScene(scene: Scene) {
    this.persistent.forEach((go) => {
      go.persistent = true;
      scene.add(go);
    });
  }

  resume(key: string) {
    const scene = this.getScene(key);
    if (scene) this.resumeByScene(scene);
  }

  private resumeByScene(scene: Scene) {
    scene.resume();
  }

  getScene(key: string): Scene {
    const scene = this.scenes.get(key);
    if (scene) {
      return scene;
    } else {
      throw new Error('SceneManager does not contain key "' + key + '"!');
    }
  }

  end(key: string) {
    const scene = this.getScene(key);
    if (scene) this.endByScene(scene);
  }

  private endByScene(scene: Scene) {
    const index = this.endQueue.indexOf(scene);
    if (index === -1) {
      this.endQueue.push(scene);
    } else {
      if (this.isDebug) console.log('SceneManager tried to end scene of key "' + scene.key + '" but it is already ending!');
    }
  }

}