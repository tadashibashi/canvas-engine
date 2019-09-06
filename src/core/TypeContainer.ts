/**
 * Wrapper around a Map to provide TypeScript casting and simpler interface
 */
export class TypeContainer {
	private arr: any[] = [];

	get<T>(type: new(...any: any[]) => T): T | null {
		let arr = this.arr;
		let index = this.indexOfType(type, this.arr);
		if (index !== -1) {
			return this.arr[index] as T;
		} else {
			console.log('Warning! ServiceContainer does not contain an item of type:', type.name, 'which was attempted to be retrieved by ServiceContainer.get()');
			return null;
		}
	}

	private indexOfType<T>(type: Function, arr: any[]): number {
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
	set<T>(item: T): this {
		let index = this.indexOfType(item.constructor, this.arr);
		if (index === -1) {
			this.arr.push(item);
		} else {
			console.log('Warning! TypeContainer already contains an item of type: ' + type.name + '. Aborting set function.');
		}
		return this;
	}
}