import { Delegate } from './Delegate';

/**
 * Houses a group of Delegates with the same signature. Accessible via key of your own choosing.
 * @type K The type of key to reference each Delegate. Recommended type are specific strings separated by '|'.
 * @type F The type of function contained in this DelegateGroup
 */
export class DelegateGroup<K, F extends (...any: any[])=>void> {
	private readonly delegates = new Map<K, Delegate<F>>();
	
	/**
	 * Subscribes to one event
	 */
	on(key: K, context: any, callback: F): DelegateGroup<K, F> {
		let delegates = this.delegates;
		if(!delegates.has(key)) {
			delegates.set(key, new Delegate<F>());
		} 		
		delegates.get(key).subscribe(context, callback);	
		return this;
	}

	/**
	 * Removes one subscribed event handler from the specified key
	 */
	off(key: K, context: any, callback: F): DelegateGroup<K, F> {
		let delegates = this.delegates;
		if (delegates.has(key)) {
			delegates.get(key).unsubscribe(context, callback);
		}
		return this;
	}

	/**
	 * Removes every subscription from the specified key
	 */
	clear(key: K) {
		let delegates = this.delegates;
		if (delegates.has(key)) {
			delegates.get(key).unsubscribeAll();
		}
	}

	/**
	 * Cleans up every subscription from every delegate and clears the internal map.
	 */
	destroy() {
		let delegates = this.delegates;
		delegates.forEach((delegate) => {
			delegate.unsubscribeAll();
		});
		delegates.clear();
	}

	/**
	 * Broadcasts an event. Please make sure ...params matches the signature of the DelegateGroup.
	 */
	send(key: K, ...params: any[]) {
		let delegates = this.delegates;
		if (delegates.has(key)) {
			delegates.get(key).send(...params);
		}
	}
}