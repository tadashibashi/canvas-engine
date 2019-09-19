import { DrawableComponent } from "./DrawableComponent";
import { InputManager } from "./input/InputManager";
import { ComponentManager } from "./ComponentManager";
import { GameObject } from "./GameObject";
import { GameTime } from "./GameTime";

export class Scene extends DrawableComponent {
  
  // ==== Referenced obtained during awake() ====
  get input(): InputManager {
    return this._input as InputManager;
  }
  private _input: InputManager | undefined;

  // === Scene-Level Objects ===
  gameobjects = new ComponentManager<GameObject>();
  update(gameTime: GameTime) {

  }

  draw(gameTime: GameTime) {

  }

}