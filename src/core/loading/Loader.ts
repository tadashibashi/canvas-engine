import { Delegate } from '../Delegate';

export abstract class Loader {
	/**
	 * An event that fires when all assets from this loader are finished loading
	 */
	readonly onLoadFinish = new Delegate<(...any: any[])=>void>();
	abstract load: () => void;
	/**
	 * Set this for debug logging purposes
	 */
	isDebug = true;
}