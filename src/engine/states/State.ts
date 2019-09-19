import { GameTime } from "../GameTime";

export namespace State {
	export const enum Event {
		ENTER,
		UPDATE,
		EXIT
	}
}
/**
 * A State stores and enacts behavior specified by the callback functions that are set.
 * It is normally managed and contained by a StateMachine.
 * @type T The type of key that it contains. Used by the StateMachine.
 */
export class State<T> {
  readonly key: T;

  private enter?: (last?: T, time?: number, data?: any) => void;
  private update?: (gameTime: GameTime, timeInState: number) => void;
  private exit?: (next?: T, time?: number, data?: any) => void;

  /**
   * Creates the State. Make sure to add state behavior with State.prototype.on().
   */
  constructor(key: T) {
    this.key = key;
  }

  /**
   * Checks whether or not this State contains a function you indicate
   * @param event 
   */
  has(event: State.Event): boolean {
    switch(event) {
      case State.Event.ENTER:
        return this.enter? true : false;
        break;
      case State.Event.EXIT:
        return this.exit? true : false;
        break;
      case State.Event.UPDATE:
        return this.update? true : false;
        break;
    }
  }

  /**
   * Runs the specified event, (which must be set via on() prior to this call).
   * Usually handled automatically by a StateManager, but can also be enacted manually.
   */
  run(event: State.Event.UPDATE, context: any, gameTime: GameTime, timeInState: number): void;
  run(event: State.Event.ENTER, context: any, lastState: T | undefined, timeInLastState: number, data?: any): void;
  run(event: State.Event.EXIT, context: any, nextState: T | undefined, timeInThisState: number, data?: any): void;
  run(event: State.Event, context: any, lastStateOrGameTime: T | GameTime | undefined, timeInLastState: number, data?: any): void {
    switch(event) {
      case State.Event.ENTER: 
        if (this.enter)
          this.enter.call(context, lastStateOrGameTime as T, timeInLastState, data);
        else
          console.log('')
        break;
      case State.Event.EXIT: 
      if (this.exit)
      	this.exit.call(context, lastStateOrGameTime as T, timeInLastState, data);
        break;
      case State.Event.UPDATE: 
      if (this.update)
      	this.update.call(context, lastStateOrGameTime as GameTime, timeInLastState);
        break;
    }  
  }

  /**
   * Sets the behavior at the indicated event by linking a callback function to it.
   * While being handled by a StateMachine:
   * Enter and exit are called once at the start and end of the State, respectively. 
   * Update is called once every frame if the StateManager is calling update().
   */
  on(event: 'enter', callback: (lastState?: T, secondsInLastState?: number, data?: any)=>void): this;
  on(event: 'exit', callback: (nextState?: T, secondsInThisState?: number, data?: any)=>void): this;
  on(event: 'update', callback: (gameTime: GameTime, timeInState: number)=>void): this;
  on(event: 'enter' | 'exit' | 'update', callback: any): this {
    switch(event) {
      case 'enter': this.enter = callback;
        break;
      case 'exit': this.exit = callback;
        break;
      case 'update': this.update = callback;
        break;
    }
    return this;
  }
}





