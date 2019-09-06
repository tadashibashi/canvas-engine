export class Delegate<F extends (...any: any[]) => void> { 
	constructor() {}
	private handle: [any, F][] = [];
	subscribe(context: any, fn: F) {
		this.handle.push([context, fn]);
	}
	unsubscribe(context: any, fn: F) {
		let index = this.handle.map((h) => {return h[0]}).indexOf(context);
		let index2 = this.handle.map((h) => {return h[1]}).indexOf(fn);
		if (index === index2 && index >= 0) {
			this.handle.splice(index, 1);
		} else {
			console.log('Does not exist on this delegate handle');
		}
	}
	send(...params: any[]) {
		this.handle.forEach((t) => {
			t[1].call(t[0], ...params);
		});
	}
}