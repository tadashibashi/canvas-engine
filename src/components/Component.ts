import { GameTime } from '../core/GameTime';
import { ComponentManager } from './ComponentManager';
import { TypeContainer } from '../core/TypeContainer';
import { Game } from './game/Game';

export abstract class Component {
	
	/**
	 * Indicates whether this component is in debug mode or not. 
	 * You can make conditionals for testing purposes with this variable.
	 */
	isDebug = false;
	isEnabled = true;
	manager: ComponentManager;

	/**
	 * Cached top-level services container. MUST be used in awake(), and all calls to it must come after it.
	 */
	services: TypeContainer;

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
	 * Initialize variables originating in this Component here
	 * @param updateOrder the order that this component will be updated by a ComponentManager. (Low = earlier, High = later)
	 */
	constructor(updateOrder = 0) {
		this._updateOrder = updateOrder;
	}

	/**
	 * Components can safely make associations with other components here. 
	 * Make sure to call all owned ComponentManager's awake() here.
	 */
	awake(): void {
		this.services = Game.engine.services;
	};

	abstract update(gameTime: GameTime): void;
	preUpdate(gameTime: GameTime) {};
	// Use to remove references
	destroy() {
		this.onUpdateOrderChanged = [];
	}

}