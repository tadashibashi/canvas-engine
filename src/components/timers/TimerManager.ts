import { Component } from "../Component";
import { Timer } from "./Timer";
import { Delegate } from "../../core/Delegate";
import { GameTime } from "../../core/GameTime";

export class TimerManager extends Component {
    private timers: Timer[] = [];
    private tempTimers: Timer[] = [];
    private toDestroy: Timer[] = [];
    constructor(numTimers: number) {
        super();
        this.initializeTimers(numTimers);
    }

    /**
     * Overwrites any existing Timers, and creates new Timer instances in internal Timer array
     * @param numTimers The number of timers to create
     */
    private initializeTimers(numTimers: number) {
        const timers = this.timers;
        for (let i = numTimers - 1; i >= 0; i--) {
            timers[i] = new Timer();
            timers[i].onBuzz.subscribe(this, (timer) => {
                this.onBuzz.send(i);
            });
        }
    }

    /**
     * Get a Timer from internal Timer array.
     * @param index
     */
    get(index: number): Timer {
        if (index <= this.timers.length && index >= 0)
            return this.timers[index];
        else {
            throw new Error('Timer index is out of range!');
        }
    }

    /**
     * Create a timer with callback that will destroy itself on buzz. 
     * Returns Timer for own handling in case you want to halt the Timer before it 'buzzes'.
     * @param callback Callback to fire when the Timer goes off
     * @param time The time, in either seconds or game ticks
     * @param isDelta Time Unit, TRUE: Delta Seconds. FALSE: Game Ticks.
     */
    fireAndForget(callback: () => void, time: number, isDelta = true): Timer {
        const timer = new Timer(isDelta);
        timer.onBuzz.subscribe(this, (t) => {
            this.toDestroy.push(t);
            callback();
        });
        timer.start(time);
        this.tempTimers.push(timer);
        return timer;
    }

    /**
     * Sends event callbacks only on indexed timers, not temp fire-and-forget timers
     */
    onBuzz = new Delegate<(index: number) => void>();

    update(gameTime: GameTime): void {
        // Update indexed timers
        let timers = this.timers;
        timers.forEach((timer) => {
            timer.update(gameTime);
        });
        // Update temporary timers
        timers = this.tempTimers;
        timers.forEach((timer) => {
            timer.update(gameTime);
        });
        // Destroy every temporary timer queued for destruction
        timers = this.toDestroy;
        timers.forEach((timer) => {
            timer.destroy;
            let index = this.tempTimers.indexOf(timer);
            if (index !== -1) {
                this.tempTimers.splice(index, 1);
            }
            timer.destroy();
        });
        this.toDestroy = [];
    }

    destroy(): void {
        let timers = this.timers;
        timers.forEach((timer) => timer.destroy());
        timers = this.tempTimers;
        timers.forEach((timer) => timer.destroy());
        timers = this.toDestroy;
        timers.forEach((timer) => timer.destroy());

        this.timers = [];
        this.tempTimers = [];
        this.toDestroy = [];

        this.onBuzz.unsubscribeAll();
        super.destroy();
    }
}