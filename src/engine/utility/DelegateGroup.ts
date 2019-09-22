import { Delegate } from './Delegate';

/**
 * Houses a group of Delegates with the same signature. Accessible via key of your own choosing.
 * @type K The type of key to reference each Delegate. Recommended type are specific strings separated by '|'.
 * @type F The type of function contained in this DelegateGroup
 */
export class DelegateGroup<K, F extends (...any: any[])=>void> {
	private delegates = new Map<K, Delegate<F>>();
	
	/**
	 * Subscribes to one event
	 */
	on(key: K, callback: F, context: any = null): DelegateGroup<K, F> {
		const delegate = this.delegates.get(key);
		if (delegate) {
			delegate.subscribe(callback, context);
		}	else {
			console.log('Error! Delegate group does not contain the key:', key);
		}	
		return this;
	}

	constructor(...keys: K[]) {
		const delegates = this.delegates;
		keys.forEach((key) => {
			delegates.set(key, new Delegate<F>());
		});
	}

	/**
	 * Removes one subscribed event handler from the specified key
	 */
	off(key: K, callback: F, context: any = null): DelegateGroup<K, F> {
		const delegate = this.delegates.get(key);
		if (delegate) {
			delegate.unsubscribe(callback);
		}
		return this;
	}

	/**
	 * Removes every subscription from the specified key
	 */
	clear(key: K) {
		const delegate = this.delegates.get(key);
		if (delegate) {
			delegate.unsubscribeAll();
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
		delete this.delegates;
	}

	/**
	 * Returns the length of the delegate or -1 if an invalid key
	 * @param key key of the delegate to find the length of
	 */
	length(key: K) {
		const delegate = this.delegates.get(key);
		if (delegate) {
			return delegate.length;
		} else {
			return -1;
		}
	}

	/**
	 * Broadcasts an event. Please make sure ...params matches the signature of the DelegateGroup.
	 */
	send(key: K, ...params: any[]) {
		const delegate = this.delegates.get(key);
		if (delegate) {
			delegate.send(...params);
		}
	}
}