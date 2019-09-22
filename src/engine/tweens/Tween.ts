import { GameTime } from "../GameTime";


export class Tween {
	private finish?: () => void;
	private step?: (time: number, currentValue: number, currentRep?: number) => void;
	private currentTime: number;
	private startingValues: number[] = [];
	private relativeEndValues: number[] = [];
	private endVals: number[];
	private props: string[];
	private duration: number;
	private isYoyo = false;
	private isYoyoing = false;
	private isPaused = false;
	private maxRepetitions = 0;
	private currentRepetition = 0;
	onDestroy: ((id: number)=>void)[] = [];
	
	constructor(public readonly id: number, private obj: any, props: string[] | string, endVals: number[] | number, duration: number, private tweenFunction: (t: number, b: number, c: number, d: number) => number) {
		this.currentTime = 0;
		if (Array.isArray(props) && Array.isArray(endVals)) {
			this.endVals = endVals;
			this.props = props;
			props.forEach((prop, i) => {
				this.startingValues[i] = obj[prop];
				this.relativeEndValues[i] = endVals[i] - this.startingValues[i];
			});
		} else {
			this.endVals = [endVals as number];
			this.props = [props as string];
			this.startingValues[0] = obj[props as string];
			this.relativeEndValues[0] = (endVals as number) - this.startingValues[0];
		}

		
		this.duration = duration;
	}

	setPause(paused: boolean) {
		this.isPaused = paused;
		return this;
	}

	setRepeat(repetitions: number) {
		if (repetitions === -1) {
			this.currentRepetition = -1;
		} else if (repetitions > 0) {
			this.maxRepetitions = repetitions;
		}
		return this;
	}

	destroy() {
		this.onDestroy.forEach((fn) => {
			fn(this.id);
		});
		this.onDestroy = [];
	}

	update(gameTime: GameTime) {
		if (!this.obj) { // Destroy this tween if the object no longer exists
			this.destroy();
			return;
		}
		
		if (this.isPaused) return; // exit if paused

		let duration = this.duration;

		if (this.isYoyoing) {
			// Add time
			this.currentTime = Math.max(this.currentTime - gameTime.deltaSec, 0);
		} else {
			// Subtract time
			this.currentTime = Math.min(this.currentTime + gameTime.deltaSec, duration);
		}
		let time = this.currentTime;

		let props = this.props;
		props.forEach((prop, i) => {
			let val = this.tweenFunction(time, this.startingValues[i], this.relativeEndValues[i], duration);
		if (this.obj[prop] != val)
			this.obj[prop] = val;
		
		// step callback
		if (this.step) {
			this.step(time, val, this.currentRepetition);
		}
		});
		



		
		if (this.isYoyo) {
			// Is a Yoyo
			if (this.isYoyoing) {
				// Is Yoyoing (time moving negatively)
				if (time === 0) {
					// We have hit our goal
					if (this.finish) {
						this.finish();
					}
					if (this.currentRepetition < this.maxRepetitions) {
						this.isYoyoing = false;
						if (this.currentRepetition !== -1) this.currentRepetition += 1;
					} else {
						this.destroy();
						this.reset();
					}
				} // end time===0
			} else {
				// Set to yoyoing if we have reached the destination
				if (time === duration) {
					this.isYoyoing = true;
				}
			}
		} else {
			// NOT a Yoyo
			// finish and destroy if past the duration
			if (time === duration) { 
				if (this.finish) {
					this.finish();
				}
				if (this.currentRepetition < this.maxRepetitions) {
					if (this.currentRepetition !== -1) this.currentRepetition += 1;
				} else {
					this.destroy();
					this.reset();
				}
				
			}
		}
	}

	reset() {
		this.currentRepetition = this.currentRepetition === -1? -1 : 0;
		this.isYoyoing = false;
		this.currentTime = 0;
	}

	onFinish(fn: () => void): Tween {
		this.finish = fn;
		return this;
	}

	onStep(fn: (time: number, currentValue: number, currentRep?: number) => void) {
		this.step = fn;
		return this;
	}

	setYoyo(yoyo: boolean) {
		this.isYoyo = yoyo;
		return this;
	}
}