import { GameTime } from '../core/GameTime';
import { ComponentManager } from './ComponentManager';

export abstract class Component {
	
	/**
	 * Indicates whether this component is in debug mode or not. 
	 * You can make conditionals for testing purposes with this variable.
	 */
	isDebug = false;
	
	manager: ComponentManager;

	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onUpdateOrderChanged: ((component: Component, value: number) => void)[] = [];

	private _updateOrder: number;
	get updateOrder() {return this._updateOrder;}
	set updateOrder(val: number) {
		this._updateOrder = val;
		if (this.onUpdateOrderChanged) {
			this.onUpdateOrderChanged.forEach((fn) => {
				fn(this, val);
			});
		}
	}

	/**
	 * @param updateOrder the order that this component will be updated by a ComponentManager. (Low = earlier, High = later)
	 */
	constructor(updateOrder = 0) {
		this._updateOrder = updateOrder;
	}

	/**
	 * Components can safely make associations with other components here.
	 */
	awake(): void {};

	abstract update(gameTime: GameTime): void;

	// Use to remove references
	destroy() {
		this.onUpdateOrderChanged = [];
	}

}