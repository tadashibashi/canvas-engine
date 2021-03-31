import { DrawableComponent } from "../DrawableComponent";
import { ComponentManager } from "../ComponentManager";
import { GameTime } from "../GameTime";
import { Scene } from "../scenes/Scene";

/**
 * The base class for all GameObjects. Lightweight where there are no components. It is a blank slate.
 */
export class GameObject extends DrawableComponent {
	wasCreated = false;
	components: ComponentManager;
	scene!: Scene;
	persistent = false;
	constructor(tag?: string) {
		super(tag, 0, 0);
		this.components = new ComponentManager();
	}

	/**
	 * Here it is safe to call on manager/scene and reference other component dependencies within the manager. Useful for setting up the GameObject. For all classes directly inheriting from GameObject, please call super.awake() at the very end of awake() to initialize all components.
	 */
	create() {
		this.components.create();
		this.wasCreated = true;
	}

	update(gameTime: GameTime) {
		this.components.update(gameTime);
	}

	draw(gameTime: GameTime) {
		this.components.draw(gameTime);
	}

	destroy() {
		this.components.destroy();
		delete this.components;
		super.destroy();
	}
}