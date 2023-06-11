import { IDestroyable, IDebuggable, IAwakable, IUpdatable, IEnablable } from "./types/interfaces";
import { ComponentManager } from "./ComponentManager";
import { TypeContainer } from "./utility/TypeContainer";
import { Delegate } from "./utility/Delegate";
import { Game } from "./Game";
import { GameTime } from "./GameTime";

export abstract class Component implements IDestroyable, IDebuggable, IAwakable, IUpdatable, IEnablable {
	
	/**
	 * Indicates whether this component is in debug mode or not. 
	 * You can make conditionals for testing purposes with this variable.
	 */
	isDebug = false;
  isEnabled = true;  
  readonly tag: string;

	/**
	 * All references to the manager must happen during or after Awake!
	 * Make sure to call super.awake() before using this.
	 */
	manager!: ComponentManager<any>;

	/**
	 * Container containing global services. Anything put into it can be retrieved via get. Best practice to only let the Game put items into it.
	 */
	protected services: TypeContainer;

	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onUpdateOrderChanged = new Delegate<((component: Component, value: number) => void)>();
	onDestroy = new Delegate<(component: Component) => void>();

	
	get updateOrder() {return this._updateOrder;}
	set updateOrder(val: number) {
		if (this._updateOrder !== val) {
			this._updateOrder = val;
			this.onUpdateOrderChanged.send(this, val);
		}	
	}
	private _updateOrder: number;
 	
	/**
	 * Initialize variables originating in this Component here
	 * @param updateOrder the order that this component will be updated by a ComponentManager. (Low = earlier, High = later)
	 */
  constructor(tag?: string | null, updateOrder = 0) {
    this._updateOrder = updateOrder;
		if (tag) {
			this.tag = tag;
		} else {
			this.tag = '';
		}  
		this.services = Game.engine.services;
	}

	/**
	 * Components can safely make associations with other components here. This is when the manager is set and becomes available.
	 * IMPORTANT! Make sure to call all object-owned ComponentManager's awake() here, so they can connect their own references.
	 */
	create(): void {};

	/**
	 * Occurs once during every game frame
	 */
	abstract update(gameTime: GameTime): void;
	
	/**
	 * Used to remove all class-level cached references and callbacks.
	 * IMPORTANT! Call super.destroy() after own class' references are removed
	 * in order to remove parent class cached references
	 */
	destroy() {
		this.onDestroy.send(this);
		this.onDestroy.unsubscribeAll();
		this.onUpdateOrderChanged.unsubscribeAll();
	}

}