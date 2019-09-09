import { GameTime } from '../../core/GameTime';
import { State } from './State';
import { Component } from '../Component';
import { Delegate } from '../../core/Delegate';

export class StateMachine<T> extends Component {
	private states: Map<T, State<T>>;
  private state: State<T> | undefined = undefined;
  private isPlaying: boolean = false;
	private _timeInState: number = 0;
	get timeInState() {return this._timeInState;}

	/**
	 * Subscribe to get notifications of state changes.
	 */
	readonly onStateChanged = new Delegate<(newState: T, lastState?: T) => void>();

	constructor(private context: any) {
		super();
    this.states = new Map<T, State<T>>();
  }

  // ============= EVENT CALLBACKS ================================
  update(gameTime: GameTime): void {
    let state = this.state;
    if (state && this.isPlaying && state.has('update')) {
    	this._timeInState += gameTime.deltaSec;
      state.run('update', this.context, gameTime, this._timeInState);
    }
  }

	/**
	 * Add one or multiple pre-created states to the machine.
	 * @param params The pre-created states to add
	 */
  addExisting(...params: State<T>[]): void {
    params.forEach((state) => {
      this.states.set(state.key, state);
    });
  }

	/**
	 * Creates a state and adds it to the StateMachine. Use waterfall notation for readable code. e.g.
	 * ```typescript
	 * this.states.add(PlayerState.IDLE)
	 *  .onenter( idleEnter )
	 *  .onupdate( idleUpdate )
	 *  .onexit((next) => {
	 * 		console.log("Exiting idle state. Now entering " + next);
	 * });```
	 * @param key Identifying key of type T. Enums are preferred.
	 */
	add(key: T): State<T> {
    let state = new State(key);
    this.states.set(state.key, state);
    return state as State<T>;
  }

  /**
   * Starts a State, exiting the last one
   * @param key The key of the State to start
   * @param data Extra data for the events to receive
   */
  start(key: T, data?: any) {
  	// Undefined check
    if (key === undefined || key === null) return;

    // If there is already a state playing fire the old state's exit event
    if (this.isPlaying === true) {
    	// and this state exists, and an exit function exists on this state
      if (this.state && this.state.has('exit')) {
      	// Fire the state's exit event
        this.state.run('exit', this.context, key, this._timeInState, data);
        if (this.isDebug) {
	        console.log(`[${this.context.constructor.name} 
	        	StateMachine] Exiting state <- ${this.state.key}`);
        }
      }
    }

    // Fire the new state's enter event and set the new state to be the current state
    let lastStateKey = this.state? this.state.key : undefined;
    this._timeInState = 0;
    this.state = this.states.get(key);
    if (this.state) {
    	if (this.state.has('enter')) {
    		this.state.run('enter', this.context, lastStateKey? lastStateKey : undefined, data);
    		if (this.isDebug) {
    			console.log(`[${this.context.constructor.name} StateMachine] Entering state -> ${this.state.key}`);
    		}
    		
    	}
       
    	if (lastStateKey !== this.state.key && this.onStateChanged) {
    		this.onStateChanged.send(key, lastStateKey);
    	}
    	
    	this.isPlaying = true;
    }
    

  }

  unpause() {
    if (this.state) {
    	// there is a state
      this.isPlaying = true;
    } else {
    	// there is no state queued
			if (this.isDebug) console.log(`[${this.context.constructor.name} StateMachine Warning! Tried to unpause state, but there is none queued!`);
    }
  }

  pause() {
    this.isPlaying = false;
  }

  /**
   * 
   * @param params Additional parameters the exit event will receive
   */
  stop(...params: any) {
    if (this.isPlaying) {
      this.isPlaying = false;
      if (this.state && this.state.has('exit')) {
        this.state.run('exit', this.context, null, this._timeInState, params);
        if (this.isDebug) console.log(`[${this.context.constructor.name} StateMachine] 
        	Exiting state <- ${this.state.key}`);
      }   
    }
  }

  /**
   * The key of the currently running state
   */
  get currentKey() {
    if (this.state) {
      return this.state.key;
    }
  }
    
  /**
   * Remove state(s) from the StateMachine
   * @param params Key(s) of States to Remove
   */
  remove(...params: T[]): void {
    for(let i = 0; i < params.length; i++) {
    	this.states.delete(params[i]);
    }
  }
}