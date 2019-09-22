import { GameTime } from "../GameTime";
import { DelegateGroup } from "../utility/DelegateGroup";
import { StateQueue } from "./StateMachine";

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
  private context: any;
  private events = new DelegateGroup<State.Event, (gameTime: GameTime, time: number, state: State<T>) => void>(State.Event.ENTER, State.Event.EXIT, State.Event.UPDATE);

  /**
   * Public API for subscribing to this state
   * @param event The event name
   * @param callback The callback to fire on event
   * @param context (Optional) Replacement binding, leave blank or null for the default context initialized in the State/StateMachine.
   */
  on(event: 'enter' | 'exit' | 'update', callback: (gameTime: GameTime, seconds: number, state: State<T>) => void, context: any = null) {
    const ctx = context || this.context;
    switch(event) {
      case 'enter':
        this.events.on(State.Event.ENTER, callback, ctx);
      break;
      case 'exit':
        this.events.on(State.Event.EXIT, callback, ctx);
      break;
      case 'update':
        this.events.on(State.Event.UPDATE, callback, ctx);
      break;
    }
    return this;
  }
  /**
   * Creates the State. Make sure to add state behavior with State.prototype.on().
   */
  constructor(key: T, context: any) {
    this.key = key;
    this.context = context;
  }

  /**
   * Runs the specified event, (which must be set via on() prior to this call).
   * Usually handled automatically by a StateManager, but can also be enacted manually.
   */
  run(event: State.Event.UPDATE, gameTime: GameTime, secondsInState: number, stateQueue: StateQueue<T>): void;
  run(event: State.Event.ENTER, gameTime: GameTime, secondsInLastState: number, stateQueue: StateQueue<T>): void;
  run(event: State.Event.EXIT, gameTime: GameTime, secondsInPastState: number, stateQueue: StateQueue<T>): void;
  run(event: State.Event, gameTime: GameTime, seconds: number, stateQueue: StateQueue<T>): void {
    this.events.send(event, gameTime, seconds, stateQueue);
  }

  destroy() {
    this.events.destroy();
    delete this.events;
  }
}





