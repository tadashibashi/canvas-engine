import { Component } from "../Component";
import { GameTime } from "../../core/GameTime";
import { Delegate } from "../../core/Delegate";

export class Timer extends Component {
    /**
     * Whether or not this timer is counting in seconds or ticks. Set during construction.
     * TRUE: seconds, FALSE: ticks.
     */
    readonly isDeltaTimer: boolean;

    /**
     * Time left on the counter. Units are either seconds or ticks depending on value of isDeltaTimer
     */
    get time(): number {
        return this.time;
    }
    private _time = 0;

    /** 
     * Whether or not the timer is actively counting down (can return true even if paused)
     * Once a timer has buzzed isActive is set to false until start is called again.
     */
    get isActive(): boolean {
        return this._isActive;
    }
    private _isActive = false;

    /**
     * If true, this prevents this timer from counting down until pause is set back to false 
     */
    pause = false;

    /**
     * Event that fires when the timer 'goes off' 
     */
    onBuzz = new Delegate<(timer: Timer) => void>();

    constructor(isDeltaTimer = true) {
        super();
        this.isDeltaTimer = isDeltaTimer;
    }

    /**
     * Starts the timer with a specified time
     * @param time The time to countdown. Units either in seconds (isDeltaTimer === true) or steps (isDeltaTimer === false).
     */
    start(time: number) {
        this._isActive = true;
        this._time = time;
    }

    /**
     * Add time to the counter
     * @param amount
     */
    addTime(amount: number) {
        this._time += amount;
    }

    update(gameTime: GameTime) {
        if (this._isActive && !this.pause) {
            if (this.isDeltaTimer) {
                this._time -= gameTime.deltaSec;
            } else {
                this._time -= 1;
            }
                
            if (this._time <= 0) {
                this._time = 0;
                this.onBuzz.send(this);
                this._isActive = false;
            }
        }
    }

    destroy() {
        this.onBuzz.unsubscribeAll();
        super.destroy();
    }
}