import { Component } from '../Component';
import { Tween } from './Tween';
import { GameTime } from '../../GameTime';


export class Tweener extends Component {
	idTicket = 0;
	tweens: Tween[] = [];
	private isPaused: boolean = false;

	constructor() {
		super(true, false);
	}
	/**
	 * A short-hand way of creating and firing a tween at once
	 * @param obj The object to enact this tween on
	 * @param prop The property of the object as a string. Property must be a number.
	 * @param endVal the end target numerical value
	 * @param duration the time in seconds
	 */
	tweenTo(obj: object, prop: string, endVal: number, duration: number, tweenFunction: (t: number, b: number, c: number, d: number) => number): Tween {
		let newTween = this.make(obj, prop, endVal, duration, tweenFunction);
		this.fire(newTween);
		return newTween;
	}

	make(obj: object, prop: string, endVal: number, duration: number, tweenFunction: (t: number, b: number, c: number, d: number) => number): Tween {
		let newTween = new Tween(this.idTicket, obj, prop, endVal, duration, tweenFunction);
		this.idTicket += 1;
		return newTween;
	}

	fire(tween: Tween, interrupt = true): void {
		let index = this.getIndexByID(tween.id);
		if (index === -1) {
			this.tweens.push(tween);
		} else if (interrupt) {
			this.remove(tween.id);
			tween.reset();
			this.tweens.push(tween);
		}
	}

	setPaused(paused: boolean) {
		this.isPaused = paused;
	}

	update(gameTime: GameTime) {
		if (this.isPaused) return;
		let tweens = this.tweens;
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
			this.tweens.splice(index, 1);
		}
	}
}
