export class ArrayMap<K, T> {
  private map = new Map<K, T[]>();
  /**
   * Creates a new ArrayMap
   * @param dynamicGetSet TRUE: add new array entries when none exist (addToArray/get)
   * FALSE: throw an error when an entry does not exist
   */
  constructor(private dynamicGetSet = true) {}
  
  /** Add new array to the map */
  add(tag: K): T[] {
    const newArr = [] as T[];
    this.map.set(tag, newArr);
    return newArr;
  }

  /** Get an array from the map */
  get(key: K): T[] {
    let arr = this.map.get(key);
    if (!arr) {
      if (this.dynamicGetSet)
        arr = this.add(key);
      else {
        throw new Error('Key does not exist in ArrayMap!');
      }
    }
    return arr;
  }

  /** Add a value to an array */
  addToArray = (key: K, val: T): void => {
    this.get(key).push(val);
  }

  /** Removes a value from the selected array */
  removeFromArray = (key: K, val: T): void => {
    let arr = this.map.get(key);
    if (!arr) {
      throw new Error('Cannot remove value from an entry: ' + key + ', that does not exist!');
    } else {
      const index = arr.indexOf(val);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
  }

  /** Deletes one array from the internal map */
  clear = (key: K): void => {
    this.map.delete(key);
  }
  /** Deletes all arrays from the internal map */
  clearAll = (): void => {
    this.map.clear();
  }
}