import { Component } from './Component';
import { DrawableComponent } from './DrawableComponent';
import { GameTime } from '../core/GameTime';



export class ComponentManager extends DrawableComponent {
	private components: Component[] = [];
	private drawList: DrawableComponent[] = [];


	awake() {
		this.forEach(c => {
			c.awake();
		});
		this.sortUpdateListOrder();
		this.sortDrawListOrder();
	}

	/**
	 * Gets a component contained by this manager. Returns null if none.
	 * @param type ClassName of the type of component to find
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

	forEach(fn: (component: Component, index: number, components: Component[]) => void): void {
		let components = this.components;
		for (let i=0; i<components.length; i++) {
			fn(components[i], i, components);
		}
	}	

	forEachDrawable(fn: (component: DrawableComponent, index: number, components: DrawableComponent[]) => void): void {
		let components = this.drawList;
		for (let i=0; i<components.length; i++) {
			fn(components[i], i, components);
		}
	}

	sortDrawListOrder = () => {
		this.drawList = this.drawList.sort((a, b) => (a.drawOrder > b.drawOrder)? 1 : -1);
	}	
	sortUpdateListOrder = () => {
		this.components = this.components.sort((a, b) => (a.updateOrder > b.updateOrder)? 1 : -1);
	}

	update(gameTime: GameTime) {
		this.forEach((c) => {
			if (c.isEnabled) c.update(gameTime);
		});
	}

	preUpdate(gameTime: GameTime) {
		this.forEach((c) => {
			c.preUpdate(gameTime);
		});
	}

	draw(gameTime: GameTime) {
		this.forEachDrawable((c) => {
			if (c.isEnabled) c.draw(gameTime);
		});
	}

	destroy() {
		this.forEach(c => c.destroy());
		this.components = [];
		this.drawList = [];
	}
}