import { GameTime } from '../../core/GameTime';

/**
 * A State to defines event code managed and contained by a StateMachine 
 */
export class State<T> {
  key: T;
  enter?: (last?: T, time?: number, data?: any) => void;

  /**
   * Update Event
   * @param gameTime global game time counter
   * @param timeInState time in state (in seconds)
   */
  update?: (gameTime: GameTime, timeInState: number) => void;
  exit?: (next?: T, time?: number, data?: any) => void;
  constructor(key: T, update?: ()=>void, enter?: (...params: any) => void, exit?: (...params: any) => void) {
    this.key = key;
    if (update) this.update = update;
    if (enter) this.enter = enter;
    if (exit) this.exit = exit;
  }

  onEnter(fn: (last?: T, time?: number, data?: any) => void): State<T> {
    this.enter = fn;
    return this;
  }

  onExit(fn: (next?: T, time?: number, data?: any) => void): State<T> {
    this.exit = fn;
    return this;
  }

  /**
   * 
   * @param fn Callback event to fire onUpdate
   */
  onUpdate(fn: (gameTime: GameTime, timeInState: number) => void): State<T> {
    this.update = fn;
    return this;
  }
}