import { Component } from "./Component";
import { DrawableComponent } from "./DrawableComponent";
import { Delegate } from "./utility/Delegate";
import { GameTime } from "./GameTime";

/**
 * A class that acts as a container for Components and DrawableComponents. (It is a DrawableComponent itself!)
 * @type T Constrains the type of Component to be managed. Default: Component
 */
export class ComponentManager<T extends Component = Component> extends DrawableComponent {
    private components: T[] = [];
    private tagBank = new Map<string, T[]>(); 
	private drawList: DrawableComponent[] = [];
    private activated = false;
	readonly onAdded = new Delegate<(component: T) => void>();
	readonly onRemoved = new Delegate<(component: T) => void>();

    constructor(tag?: string | null, updateOrder = 0, drawOrder = 0) {
        super(tag, updateOrder, drawOrder);
        this.onAdded.subscribe(this, this.setObjToTagBank);
        this.onRemoved.subscribe(this, this.removeObjFromTagBank);
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
    // Maybe put tagBank into a class...
    private setObjToTagBank = (obj: T): void => {
        const tag = obj.tag;
        if (tag === '') return; // Do not put in items without tags

        let arr = this.tagBank.get(tag);
        if (!arr) {
            arr = this.setNewTagBankEntry(tag);
        }
        arr.push(obj);
    }
    private removeObjFromTagBank = (obj: T): void => {
        const tag = obj.tag;
        if (tag === '') return; // Do not remove items without tags
        const arr = this.tagBank.get(tag);
        if (!arr) {
            console.log('Error! Could not remove object from the ComponentManager tagBank because tag entry does not exist!');
        } else {
            const index = arr.indexOf(obj);
            if (index !== -1) {
                arr.splice(index, 1);
            }
        }
    }
    /**
     * This provides you with a reference to an array of all tagged items, which will expand 
     * and delete automatically as elements are pushed and spliced. If there is no array established
     * for the indicated tag, this will create a new entry for that tag, to be populated in the future.
     * @param tag The tag of the array to find
     */
    getByTag(tag: string): T[] {
        const arr = this.tagBank.get(tag);
        if (arr) {
            return arr;
        } else {
            console.log('Warning! No components of queried tag name:' + tag + ', exists in this ComponentManager! Creating a new entry, and returning its empty array for potential future additions to this tag key');
            return this.setNewTagBankEntry(tag);
        }
    }
    private setNewTagBankEntry(tag: string): T[] {
        const newArr = [] as T[];
        this.tagBank.set(tag, newArr);
        return newArr;
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
	 * Add a component to the manager, return this for chaining add
	 * @param component The component to add.
	 */
	add<C extends T>(component: C) {
		if (this.components.indexOf(component) >= 0) {
			console.log('Warning. This ComponentManager already contains this Component. Aborting add function.');
        } else {
            // Cache ComponentManager to Component to enable access to other components
            component.manager = this;
			// Add component to the appropriate arrays, and add listeners for on order changed.
			if (component instanceof DrawableComponent) {
				this.drawList.unshift(component);
				component.onDrawOrderChanged.subscribe(this, this.sortDrawListOrder);
			}
			component.onDestroy.subscribe(this, this.remove);
			component.onUpdateOrderChanged.subscribe(this, this.sortUpdateListOrder);
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
			component.onUpdateOrderChanged.unsubscribe(this, this.sortUpdateListOrder);
			component.onDestroy.unsubscribe(this, this.remove);
			if (component instanceof DrawableComponent) {
				component.onDrawOrderChanged.unsubscribe(this, this.sortDrawListOrder);
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
	 * Calls every component's preUpdate in this ComponentManager
	 */
	preUpdate(gameTime: GameTime) {
		this.forEach((c) => {
			if (c.isEnabled) {
				c.preUpdate(gameTime);
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
		this.onRemoved.unsubscribeAll();
		this.components = [];
		this.drawList = [];

		super.destroy();
	}

}