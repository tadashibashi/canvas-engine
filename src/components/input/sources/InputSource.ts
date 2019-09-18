import { Component } from '../../Component';
import { Input } from '../types/Types';
import { GameTime } from '../../../core/GameTime';
import { Delegate } from '../../../core/Delegate';


export abstract class InputSource<EventType extends Event> extends Component {
	constructor(updateOrder: number) {
		super(null, updateOrder);
	}
	/**
	 * An input is a key, a button, anything that contains an axis.
	 * It is comprised of 3 number params: code, axis, lastAxis
	 * code - the button/key/controller code depending on the EventType
	 * axis - the current axis as you decide to process it in onInput
	 * lastAxis - when updated the InputSource will automatically set this
	 */
	protected inputs: Input[] = [];
	/**
	 * Captures all input events and orders them to be processed one by one
	 * This prevents mishaps when multiple events possibly happen in one frame, one overriding the other.
	 * This ensures every input from the user is accounted for.
	 */
	private eventQueue: EventType[] = [];

	/**
	 * Process all input events here
	 */
	onInput = new Delegate<(ev: EventType) => void>();


	// ============= Events ===================

	/**
	 * This should be delayed to at the end of update.
	 * This can be achieved by setting updateOrder to a bigger number
	 */
	update(gameTime: GameTime) {
		let inputs = this.inputs;

		// Sets the lastAxis
		for(let i = 0; i < inputs.length; i++) { 
		  let input = inputs[i];
		  input.lastAxis = input.axis;
		}
	}

	/**
	 * Pre-update should be called before all other updates. 
	 * Processing of input events from the queue happens here.
	 */
	preUpdate(gameTime: GameTime) {
		// This will shift the array queue forward and process the first Input in the array in onInput
		if (this.eventQueue.length > 0) {
		  let ev = this.eventQueue.shift();
		  this.onInput.send(ev);
		}
	}

	/**
	 * Adds a listener to this InputSource. 
	 * Returns pre-existing inputs, otherwise creates a new one and returns it.
	 * @param code The code of a particular input as it correlates to the EventType. 
	 * e.g. keyCode on a KeyboardEvent: 38 is the up arrow
	 */
	add(code: number): Input {
		let inputs = this.inputs;

		// Return Input if already in the array,
		let i = this.getIndexByCode(code);
		if (i !== -1) {
			return inputs[i];
		}

		// add new Input to array if not, and return it.
		let newInput = { code: code, axis: 0, lastAxis: 0 };
		inputs.push(newInput);
		return newInput;
	}

	/**
	 * Get an Input listener object that already exists.
	 * Might as well use add since it will do the same thing.
	 */
	get(code: number): Input | null {
		let i = this.getIndexByCode(code);
		if (i !== -1) {
			return this.inputs[i];
		} else {
			return null;
		}
	}

	getAll(): Input[] {
		return this.inputs;
	}

	/**
	 * Removes an input listener from this InputSource
	 */
	remove(code: number): void {
		let inputs = this.inputs;
		let i = this.getIndexByCode(code);
		if (i !== -1) {
			inputs.splice(i, 1);
			if (this.isDebug) {
				console.log('Removed Input from Controller with the code:', code);
			}
		} else {
			if (this.isDebug) {
				console.log('Warning! Could not remove the input from this Controller because the indicated Input (via \'code\' parameter) does not exist!');
			}
		}
	}

	/**
	 * Callback that adds an event to the eventQueue.
	 * The callback to add to window.addEventListener
	 */
	queueEvent = (ev: EventType) => {
		this.eventQueue.push(ev);
	} 

	removeAll(): void {
		this.inputs = [];
	}

	protected getIndexByCode(code: number): number {
		return this.inputs.map((input) => input.code).indexOf(code);
	}

	justDown(input: Input | Input[]): boolean {
	  if (Array.isArray(input)) {
	    input.forEach((c) => {
	      if (c.axis !== 0 && c.lastAxis === 0) {
	        return true;
	      }
	    });
	    return false;
	  } else {
	    return (input.axis !== 0 && input.lastAxis === 0);
	  }
	}	

	justUp(input: Input | Input[]): boolean {
	  if (Array.isArray(input)) {
	    input.forEach((c) => {
	      if (c.axis === 0 && c.lastAxis !== 0)
	        return true;
	    });
	    return false;
	  } else {
	    return (input.axis === 0 && input.lastAxis !== 0);
	  }
	}
}