/**
 * Wrapper around a js Map to provide TypeScript casting and simpler interface
 * Provides pseudo-singleton behavior since it will not accept overwrites to currently stored class/constructor keys.
 */
export class TypeContainer {
	private arr: any[] = [];
	/**
	 * @param type Constructor/ClassName of the element to search for
	 */
	get<T extends object>(type: new(...any: any[]) => T): T {
		let arr = this.arr;
		let index = this.indexOfType(type, this.arr);
		if (index !== -1) {
			return this.arr[index] as T;
		} else {
			console.log('Error! ServiceContainer does not contain an item of type: '+ type.constructor.name + ', which was attempted to be retrieved by ServiceContainer.get()');
			return {} as T;
		}
	}

	private indexOfType(type: Function, arr: any[]): number {
		for (let i=0; i<arr.length; i++) {
			if (arr[i].constructor === type) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * @param key Type to store
	 * @param item Object to store
	 */
	add<T extends object>(item: T): this {
		let index = this.indexOfType(item.constructor, this.arr);
		if (index === -1) {
			this.arr.push(item);
		} else {
			console.log('Warning! TypeContainer already contains an item of type: ' + item.constructor.name + '. Aborting set function.');
		}
		return this;
	}

	log() {
		console.log('TypeContainer contents:', this.arr);
	}
}
