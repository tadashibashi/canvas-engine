import { AssetLoadManager } from './loading/AssetLoadManager';

/**
 * Stores all game assets and contains the loader for these assets
 */
export class AssetManager {
	/**
	 * Handles all asset loading
	 */
	readonly load: AssetLoadManager;
	readonly json = new Map<string, string>();
	readonly audio = new Map<string, HTMLAudioElement>();
	readonly images = new Map<string, HTMLImageElement>();
	constructor(assetBaseURL: string) {
		this.load = new AssetLoadManager(assetBaseURL, this);
	}
}