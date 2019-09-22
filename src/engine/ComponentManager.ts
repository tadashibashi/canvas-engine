import { Component } from "./Component";
import { DrawableComponent } from "./DrawableComponent";
import { Delegate } from "./utility/Delegate";
import { GameTime } from "./GameTime";
import { ArrayMap } from "./utility/ArrayMap";

/**
 * A class that acts as a container for Components and DrawableComponents. (It is a DrawableComponent itself!)
 * @type T Constrains the type of Component to be managed. Default: Component
 */
export class ComponentManager<T extends Component = Component> extends DrawableComponent {
  private components: T[] = [];
	private drawList: DrawableComponent[] = [];
  private activated = false;
	onAdded = new Delegate<(component: T) => void>();
	onRemoved = new Delegate<(component: T) => void>();

    constructor(tag?: string | null, updateOrder = 0, drawOrder = 0) {
			super(tag, updateOrder, drawOrder);
			this.onAdded.subscribe((component) => { this.tagBank.addToArray(component.tag, component)}, this);
			this.onRemoved.subscribe((component) => {this.tagBank.removeFromArray(component.tag, component)}, this);
    }
	// ============ COMPONENT MANAGEMENT (add, get, remove, sort) ============= //
	/**
	 * Gets a component contained by this manager. Returns null if none.
	 * @param type Class name of the type of component to find.
	 */
	get<C extends T>(type: new(...any: any[]) => C): C {
		let components = this.components;
		for (let i=0; i<components.length; i++) {
			let c = components[i];
			if (c instanceof type) {
				return c;
			}
		}
		throw new Error('ComponentManager does not contain a Component of type: ' + type.name + ', which was attempted to be retrieved via get()' );
    }
    get length(): number {
			return this.components.length;
	}
	private tagBank = new ArrayMap<string, T>(true);
	
	/**
	 * This provides you with a reference to an array of all like-tagged items, which will expand 
	 * and delete automatically as elements are pushed and spliced. If there is no array existing
	 * for the indicated tag, a new one will be created for that tag, to be populated in the future.
	 * @param tag The tag of the array to find
	 */
	getByTag(tag: string): T[] {
		return this.tagBank.get(tag);
	}

	/**
	 * Gets all components of a specific type inside ComponentManager, at any given time
	 * This creates a new array that is not a reference of any array stored in this manager.
	 * @param type
	 */
	getAllOfType<C extends T>(type: new (...any: any[]) => C): C[] {
			const components = this.components;
			const componentsOfType: C[] = [];
			for (let i = 0; i < components.length; i++) {
				if (components[i] instanceof type) {
					componentsOfType.push(components[i] as C);
				}
			}
			return componentsOfType;
	}

	/**
	 * For own handling. Be careful as this is the actual reference to the components.
	 * Its order is the update order.
	 */
	getAll() {
		return this.components;
	}

	/**
	 * For own handling. Be careful as this is the actual reference to the drawList.
	 * Its order is the draw order.
	 */
	getAllDrawable() {
		return this.drawList;
	}

	/**
	 * Add a component to the manager, return this for chaining add
	 * @param component The component to add.
	 */
	add<C extends T>(component: C) {
		if (this.components.indexOf(component) >= 0) {
			if (this.isDebug) console.log('Warning. This ComponentManager already contains this Component. Aborting add function.');
		} else {
			// Cache ComponentManager to Component to enable access to other components
			component.manager = this;
			// Add component to the appropriate arrays, and add listeners for on order changed.
			if (component instanceof DrawableComponent) {
				this.drawList.unshift(component);
				component.onDrawOrderChanged.subscribe(this.sortDrawListOrder, this);
			}
			component.onDestroy.subscribe(this.remove, this);
			component.onUpdateOrderChanged.subscribe(this.sortUpdateListOrder, this);
			this.components.unshift(component);
			
			if (this.activated) {// after scene/game start will auto awake newly created component
				component.awake();
			}
			this.onAdded.send(component);
		}
		return this;	
	}

	/**
	 * Removes a Component from this ComponentManager
	 * @param component The component to remove
	 */
    remove(component: Component) {
		let index = this.components.indexOf(component as T);
		if (index !== -1) {
			component.onUpdateOrderChanged.unsubscribe(this.sortUpdateListOrder);
			component.onDestroy.unsubscribe(this.remove);
			if (component instanceof DrawableComponent) {
				component.onDrawOrderChanged.unsubscribe(this.sortDrawListOrder);
				let drawIndex = this.drawList.indexOf(component as DrawableComponent);
				this.drawList.splice(drawIndex, 1);
			}
			this.components.splice(index, 1);
			this.onRemoved.send(component);
		}
		return this;
	}

	/**
	 * Removes all Components from this ComponentManager
	 */
	private removeAll(): void {		
		this.components.forEach((component) => {
			this.remove(component);
		});
		// Remove references to all components
		this.components = [];
		this.drawList = [];
	}

	/**
	 * Updates the sort order of this ComponentManager's DrawList Components (low to high).
	 * Automatically added to each added DrawableComponent's onDrawOrderChanged event
	 * and removed when the DrawableComponent is removed.
	 */
	sortDrawListOrder = () => {
		this.drawList = this.drawList.sort((a, b) => (a.drawOrder > b.drawOrder)? 1 : -1);
		return this;
	}	

	/**
	 * Updates the update order of the component list (low to high).
	 * Automatically added to each added Component's onUpdateOrderChanged event
	 * and removed when the Component is removed.
	 */
	sortUpdateListOrder = () => {
		this.components = this.components.sort((a, b) => (a.updateOrder > b.updateOrder)? -1 : 1);
		return this;
	}

	// ================== HELPER UTILITIES ==========================
	/**
	 * Iterates through each Component and passes them to a callback
	 * @param callback The function that will be called for each Component
	 */
	forEach(callback: (component: T, index: number, components: T[]) => void) {
		const components = this.components;
		for (let i=components.length-1; i>=0; i--) {
			callback(components[i], i, components);
		}
		return this;
	}	

	/**
	 * Iterates through each DrawableComponent and passes them to a callback
	 * @param callback The function that will be called for each DrawableComponent
	 */
	forEachDrawable(callback: (component: DrawableComponent, index: number, components: DrawableComponent[]) => void) {
		let components = this.drawList;
		for (let i=components.length-1; i>=0; i--) {
			callback(components[i], i, components);
		}
		return this;
	}

	// ============== EVENT HANDLERS/CALLBACKS =====================

	awake() {
		this.forEach(c => c.awake());
		this.sortUpdateListOrder();
        this.sortDrawListOrder();
        this.activated = true;
	}

	/**
	 * Updates every component in this ComponentManager
	 */
	update(gameTime: GameTime) {
		this.forEach((c) => {
			if (c.isEnabled) {
				c.update(gameTime);
			}
		});
	}

	/**
	 * Calls every DrawableComponent's draw method in this ComponentManager
	 */
	draw(gameTime: GameTime) {
		this.forEachDrawable((c) => {
			if (c.isEnabled) {
				c.draw(gameTime);
			}
		});
	}

	/**
	 * TODO: TEST THIS FUNCTION! Does each component get destroyed?
	 */
	destroy(destroyComponentsToo = true) {
		if (destroyComponentsToo) {
			this.components.forEach((component) => {
				component.destroy();
			});
		}

		this.onAdded.unsubscribeAll();
		delete this.onAdded;
		this.onRemoved.unsubscribeAll();
		this.components = [];
		this.drawList = [];

		super.destroy();
	}

}