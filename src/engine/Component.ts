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
	get manager(): ComponentManager<any> {
		return this._manager as ComponentManager<any>;
	}
	set manager(value: ComponentManager<any>) {
		this._manager = value;
	}
	private _manager: ComponentManager | undefined;

	/**
	 * Cached top-level services container. All calls to it must come during or after awake().
	 * Make sure to call super.awake() before making references to it as well.
	 */
	get services(): TypeContainer {
		return this._services as TypeContainer;
	}
	protected _services: TypeContainer | undefined;
	setGameServices(services: TypeContainer) {
		this._services = services;
	}
	/**
	 * An event handle that others can subscribe to when the update order changes
	 */
	onUpdateOrderChanged = new Delegate<((component: Component, value: number) => void)>();
	onDestroy = new Delegate<(component: Component) => void>();

	private _updateOrder: number;
	get updateOrder() {return this._updateOrder;}
	set updateOrder(val: number) {
		this._updateOrder = val;
		this.onUpdateOrderChanged.send(this, val);
	}
 	
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
	}

	/**
	 * Components can safely make associations with other components here. 
	 * IMPORTANT! Make sure to call super.awake() to reference parent cached references
	 * Also make sure to call all object-owned ComponentManager's awake() here,
	 * so they can connect their own references.
	 */
	awake(): void {
		this._services = Game.engine.services;
	}

	/**
	 * Occurs once during every game frame
	 */
	abstract update(gameTime: GameTime): void;
	/**
	 * Occus once during every game frame before update
	 */
	preUpdate(gameTime: GameTime) {};
	
	/**
	 * Used to remove all class-level cached references and callbacks.
	 * IMPORTANT! Call super.destroy() after own class' references are removed
	 * in order to remove parent class cached references
	 */
	destroy() {
		this.onDestroy.send(this);
		this.onDestroy.unsubscribeAll();
		this.onUpdateOrderChanged.unsubscribeAll();
		this._manager = undefined;
		this._services = undefined;
	}

}