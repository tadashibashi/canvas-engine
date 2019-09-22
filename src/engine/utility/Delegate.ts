/**
 * A handle for others to subscribe callback functions to, to listen in for an event.
 * When the event occurs, use Delegate.send() to let every subscriber know the thing has just happened.
 * @type S A tuple of the type parameters
 */
export class Delegate<F extends (...any: any[])=>void> { 
	constructor() {}
	/**
	 * The inner collection of event handler functions with the contexts
	 */
	private handle: {ctx?: any, cb: F}[] = [];

	/**
	 * Subscribe a callback handler to the delegate
	 * @param context The contextual 'this' that the function will operate by
	 * @param cb The callback function to add that will trigger when this event occurs 
	 * (when Delegate.send(...params[]) is called)
	 */
	subscribe(cb: F, context: any = null): void {
		this.handle.forEach((h) => {
			if (cb === h.cb) { return; }
		});
		this.handle.push({ ctx: context, cb: cb });
	}

	/** 
	 * Returns the event handle's length 
	 */
	get length() {
		return this.handle.length;
	}
	
	/**
	 * Remove a subscription to this Delegate
	 * @param context The contextual 'this' that the function operates by
	 * @param cb The callback function to remove
	 */
	unsubscribe(cb: F): void {
		const handle = this.handle;
		handle.forEach((h, i) => {
			if (cb === h.cb) {
				handle.splice(i, 1);
				return;
			}
		});
	}

	/**
	 * Callback to every subscriber to this Delegate. Let them know the thing just happened!
	 * @param params Make sure to send the same parameters as the signature of the Delegate
	 * You should be able to see the signature by hovering over the Delegate if not this function.
	 */
	send(...params: any[]): void {
		this.handle.forEach((h) => {
			if (h.ctx === null) {
				h.cb(...params);
			} else {
				h.cb.call(h.ctx, ...params);
			}				
		});
	}

	/**
	 * Clears this delegate of all subscribers' callbacks
	 */
	unsubscribeAll() {
		this.handle = [];
	}
}