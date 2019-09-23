import { DrawableComponent } from "./DrawableComponent";
import { InputManager } from "./input/InputManager";
import { ComponentManager } from "./ComponentManager";
import { GameObject } from "./gameobjects/GameObject";
import { GameTime } from "./GameTime";

export class Scene extends DrawableComponent {
  
  // ==== Reference obtained during awake() ====
  input!: InputManager;

  // === Scene-Level Objects ===
  gameobjects = new ComponentManager<GameObject>();
  persistent: GameObject[] = [];

  constructor(tag: string) {
    super(tag);
  }
  

  create() {

  }

  update(gameTime: GameTime) {

  }

  draw(gameTime: GameTime) {

  }

}