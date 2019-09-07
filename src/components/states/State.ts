import { GameTime } from '../../core/GameTime';

/**
 * A State to defines event code managed and contained by a StateMachine 
 */
export class State<T> {
  readonly key: T;
  private enter?: (last?: T, time?: number, data?: any) => void;
  private update?: (gameTime: GameTime, timeInState: number) => void;
  private exit?: (next?: T, time?: number, data?: any) => void;

  constructor(key: T, update?: ()=>void, enter?: (...params: any) => void, exit?: (...params: any) => void) {
    this.key = key;
    if (update) this.update = update;
    if (enter) this.enter = enter;
    if (exit) this.exit = exit;
  }

  has(event: 'update' | 'enter' | 'exit'): boolean {
    switch(event) {
      case 'enter':
        return this.enter? true : false;
        break;
      case 'exit':
        return this.exit? true : false;
        break;
      case 'update':
        return this.update? true : false;
        break;
    }
  }

  run(event: 'update', context: any, gameTime: GameTime, timeInState: number): void;
  run(event: 'enter' | 'exit', context: any, lastState: T, timeInLastState: number, data?: any): void;
  run(event: 'enter' | 'update' | 'exit', context: any, lastStateOrGameTime: T | GameTime, timeInLastState: number, data?: any): void {
    switch(event) {
      case 'enter': 
        if (this.enter)
          this.enter.call(context, lastStateOrGameTime as T, timeInLastState, data);
        else
          console.log('')
        break;
      case 'exit': this.exit.call(context, lastStateOrGameTime as T, timeInLastState, data);
        break;
      case 'update': this.update.call(context, lastStateOrGameTime as GameTime, timeInLastState);
        break;
    }
    
  }

  on(event: 'enter' | 'exit', fn: (lastState?: T, timeInLastState?: number, data?: any)=>void): void;
  on(event: 'update', fn: (gameTime: GameTime, timeInState: number)=>void): void;
  on(event: 'enter' | 'update' | 'exit', fn: any): void {
    switch(event) {
      case 'enter': this.enter = fn;
        break;
      case 'exit': this.exit = fn;
        break;
      case 'update': this.update = fn;
        break;
    }
  }
}
