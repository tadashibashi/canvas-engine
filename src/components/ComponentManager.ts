import { Component } from './Component';
import { DrawableComponent } from './DrawableComponent';
import { GameTime } from '../core/GameTime';


/**
 * A class that acts as a container for Components and DrawableComponents. (It is a DrawableComponent itself!)
 */
export class ComponentManager extends DrawableComponent {
	private components: Component[] = [];
	private drawList: DrawableComponent[] = [];

	/**
	 * Called after initialization, it is safe to refer to and get components 
	 * from other services and managers here.
	 */
	awake() {
		this.forEach(c => c.awake());
		this.sortUpdateListOrder();
		this.sortDrawListOrder();
	}

	/**
	 * Gets a component contained by this manager. Returns null if none.
	 * @param type Class name of the type of component to find.
	 */
	get<T extends Component>(type: new(...any: any[]) => T): T | null {
		let components = this.components;
		for (let i=0; i<components.length; i++) {
			let c = components[i];
			if (c instanceof type) {
				return c;
			}
		}
		return null;
	}

	/**
	 * Add a component to the manager.
	 * @param component The component to add.
	 */
	add<T extends Component>(component: T): ComponentManager {
		if (this.components.indexOf(component) >= 0) {
			console.log('Warning. This ComponentManager already contains this Component. Aborting add function.');
		} else {
			// Add component to the appropriate arrays, and add listeners for on order changed.
			if (component instanceof DrawableComponent) {
				this.drawList.push(component);
				component.onDrawOrderChanged.push(this.sortDrawListOrder);
			}
			component.onUpdateOrderChanged.push(this.sortUpdateListOrder);
			this.components.push(component);
		}
		// Cache ComponentManager to Component to enable access to other components
		component.manager = this;

		return this;	
	}

	/**
	 * Removes a Component from this ComponentManager. (Optional) call destroy() on it.
	 * @param component The component to remove
	 * @param destroy Call destroy() on this component? Default: false
	 */
	remove(component: Component, destroy = false) {
		let index = this.components.indexOf(component);
		if (index !== -1) {
			if (component instanceof DrawableComponent) {
				let drawIndex = this.drawList.indexOf(component as DrawableComponent);
				this.drawList.splice(drawIndex, 1);
			}
			this.components.splice(index, 1);

			if (destroy) {
				component.destroy();
			}
		}
	}

	/**
	 * Removes all Components from this ComponentManager. (Optional) call destroy() on all.
	 * @param destroy Call destroy() on all components? Default: false
	 */
	removeAll(destroy = false) {
		if (destroy) {
			this.components.forEach((component) => {
				component.destroy();
			});
		}
		this.components = [];
		this.drawList = [];
	}

	/**
	 * Iterates through each Component and passes them to a callback
	 * @param callback The function that will be called for each Component
	 */
	forEach(callback: (component: Component, index: number, components: Component[]) => void): void {
		let components = this.components;
		for (let i=0; i<components.length; i++) {
			callback(components[i], i, components);
		}
	}	

	/**
	 * Iterates through each DrawableComponent and passes them to a callback
	 * @param callback The function that will be called for each DrawableComponent
	 */
	forEachDrawable(callback: (component: DrawableComponent, index: number, components: DrawableComponent[]) => void): void {
		let components = this.drawList;
		for (let i=0; i<components.length; i++) {
			callback(components[i], i, components);
		}
	}

	/**
	 * Updates the sort order of this ComponentManager's DrawList Components (low to high)
	 */
	sortDrawListOrder = () => {
		this.drawList = this.drawList.sort((a, b) => (a.drawOrder > b.drawOrder)? 1 : -1);
	}	

	/**
	 * Updates the update order of the component list (low to high)
	 */
	sortUpdateListOrder = () => {
		this.components = this.components.sort((a, b) => (a.updateOrder > b.updateOrder)? 1 : -1);
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

	destroy() {
		this.removeAll(true);
	}

}