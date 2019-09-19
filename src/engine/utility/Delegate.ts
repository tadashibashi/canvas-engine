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
	private handle: {context: any, callback: F}[] = [];

	/**
	 * Subscribe a callback handler to the delegate
	 * @param context The contextual 'this' that the function will operate by
	 * @param callback The callback function to add that will trigger when this event occurs 
	 * (when Delegate.send(...params[]) is called)
	 */
	subscribe(context: any, callback: F): void {
		// Check if this callback handler already exists on the handle
		let handle = this.handle;
		for (let i=0; i<handle.length; i++) {
			// if so, exit this function
			if (context === handle[i].context && callback === handle[i].callback) {			
				return;
			}
		}
		// if not, then add it to the handle!
		this.handle.push({ context: context, callback: callback });
	}
	
	/**
	 * Remove a subscription to this Delegate
	 * @param context The contextual 'this' that the function operates by
	 * @param callback The callback function to remove
	 */
	unsubscribe(context: any, callback: F): void {
		const handle = this.handle;
		for (let i=0; i<handle.length; i++) {
			if (context === handle[i].context && callback === handle[i].callback) {
				this.handle.splice(i, 1);
				return;
			}
		}
	}

	/**
	 * Callback to every subscriber to this Delegate. Let them know the thing just happened!
	 * @param params Make sure to send the same parameters as the signature of the Delegate
	 * You should be able to see the signature by hovering over the Delegate if not this function.
	 */
	send(...params: any[]): void {
		this.handle.forEach((t) => {
			t.callback.call(t.context, ...params);
		});
	}

	/**
	 * Clears this delegate of all subscribers' callbacks
	 */
	unsubscribeAll() {
		this.handle = [];
	}
}