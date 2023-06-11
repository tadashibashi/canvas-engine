import { Component } from "../Component";
import { State } from "./State";
import { Delegate } from "../utility/Delegate";
import { GameTime } from "../GameTime";

export class StateQueue<T> {
  current: State<T> | null = null;
  last: State<T> | null = null;
}

export class StateMachine<T> extends Component {
	private states: Map<T, State<T>>;
  private queue: StateQueue<T> = {
    current: null, last: null
  };
  private isPlaying: boolean = false;
  private _timeInState: number = 0;
  private gameTime = new GameTime();
  private context: any;
	get timeInState() {return this._timeInState;}

	/**
	 * Subscribe to get notifications of state changes.
	 */
	onStateChanged = new Delegate<(newState: T, lastState?: T) => void>();

	constructor(context?: any) {
    super();
    this.context = context ? context : null;
    this.states = new Map<T, State<T>>();
  }

  // ============= EVENT CALLBACKS ================================
  create() {};

  update(gameTime: GameTime): void {
    // Replace temp GameTime with the Game's GameTime
    if (this.gameTime !== gameTime) this.gameTime = gameTime;

    let state = this.queue.current;
    if (state && this.isPlaying) {
      this._timeInState += gameTime.deltaSec;
      state.run(State.Event.UPDATE, gameTime, this.timeInState, this.queue);
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
	 * });
   * ```
	 * @param key Identifying key of type T. Enums are preferred.
	 */
	add(key: T): State<T> {
    let state = new State(key, this.context);
    this.states.set(state.key, state);
    return state as State<T>;
  }

  /**
   * Starts a State, exiting the last one
   * @param key The key of the State to start
   * @param data Extra data for the events to receive
   */
  start(key: T) {
    const nextstate = this.states.get(key);
    const current = this.queue.current;
    if (nextstate) {
      if (this.isPlaying && current) {
        current.run(State.Event.EXIT, this.gameTime, this.timeInState, this.queue);
        if (this.isDebug) {
          console.log(`[${this.context.constructor.name} StateMachine] Exiting state <- ${current.key}`);
        }
      }
         
      this.queue.last = this.queue.current || nextstate;
      this.queue.current = nextstate;

      nextstate.run(State.Event.ENTER, this.gameTime, this._timeInState, this.queue);
      if (this.isDebug) {
        console.log(`[${this.context.constructor.name} StateMachine] Entering state -> ${nextstate.key}`);
      }

      this.isPlaying = true;
      this._timeInState = 0;

      // Send notification of state change
    	if (this.queue.last.key !== this.queue.current.key || !this.isPlaying) {
    		this.onStateChanged.send(this.queue.current, this.queue.last);
      }

    }    
  }

  unpause() {
    if (this.queue.current) {
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
      const state = this.queue.current;
      this.isPlaying = false;
      if (state) {
        state.run(State.Event.EXIT, this.gameTime, this._timeInState, params);
        if (this.isDebug) console.log(`[${this.context.constructor.name} StateMachine] 
        	Exiting state <- ${state.key}`);
      }   
    }
  }

  /**
   * The key of the currently running state
   */
  get currentKey() {
    return this.queue.current ? this.queue.current.key : undefined;
  }
    
  /**
   * Remove state(s) from the StateMachine
   * @param params Key(s) of States to Remove
   */
  remove(key: T): void {
    this.states.delete(key);
  }

  destroy() {
    this.states.forEach((state) => {
      state.destroy();
    })
    this.states.clear();
    this.onStateChanged.unsubscribeAll();

    super.destroy();
  }
}