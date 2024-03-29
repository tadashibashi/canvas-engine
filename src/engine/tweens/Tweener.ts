import { Component } from "../Component";
import { Tween } from "./Tween";
import { GameTime } from "../GameTime";

export class Tweener extends Component {
	idTicket = 0;
	tweens: Tween[] = [];
	private removeQueue: Tween[] = [];
	private isPaused: boolean = false;

	constructor() {
		super();
	}

	/**
	 * A short-hand way of creating and firing a tween at once
	 * @param obj The object to enact this tween on
	 * @param props The property of the object as a string. Property must be a number.
	 * @param endVals the end target numerical value
	 * @param duration the time in seconds
	 */
	tweenTo(obj: object, props: string[] | string, endVals: number[]| number, duration: number, tweenFunction: (t: number, b: number, c: number, d: number) => number): Tween {
        let newTween = this.make(obj, props, endVals, duration, tweenFunction);
        newTween.onDestroy.push((tweenid) => {
            this.remove(tweenid);
        });
		this.fire(newTween);
		return newTween;
	}

	make(obj: object, props: string[] | string, endVals: number[] | number, duration: number, tweenFunction: (t: number, b: number, c: number, d: number) => number): Tween {
		let newTween = new Tween(this.idTicket, obj, props, endVals, duration, tweenFunction);
		this.idTicket += 1;
		return newTween;
	}

	fire(tween: Tween, interrupt = true): void {
		if (tween.destroyed) { // resets tween
			tween.destroyed = false;
		}

		let index = this.getIndexByID(tween.id);
		if (index === -1) {
			this.tweens.push(tween);
		} else if (interrupt) {
			this.remove(tween.id);
			tween.reset();
			this.tweens.push(tween);
        }
        tween.onDestroy.push((tweenid) => {
            this.remove(tweenid);
        });
	}

	setPaused(paused: boolean) {
		this.isPaused = paused;
	}

	update(gameTime: GameTime) {
		if (this.isPaused) return;
		const tweens = this.tweens;
		const removeQueue = this.removeQueue;
		// remove tweens to be destroyed
		if (removeQueue.length > 0) {
			while(removeQueue.length > 0) {
				let tween = removeQueue.shift();
				if (tween) {
					let index = tweens.indexOf(tween);
					if (index !== -1) {
						tweens.splice(index, 1);
					}
				}
			}
		}
		// Update tweens
		for (let i=0; i<tweens.length; i++) {
			tweens[i].update(gameTime);
		}

	}

	getIndexByID(id: number) {
		return this.tweens.map((t)=>t.id).indexOf(id);
	}

	remove(id: number) {
		let index = this.getIndexByID(id);
		if (index !== -1) {
			this.removeQueue.push(this.tweens[index]);
		}
	}

	destroy() {
		// Destroy all tweens
		this.tweens.forEach((tween) => {
			tween.destroy();
		});

		super.destroy();
	}
}
