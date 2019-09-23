import { AssetLoadManager } from './loading/AssetLoadManager';
import { FMODLoader } from '../audio/fmodstudio/FMODLoader';

/**
 * Stores all game assets and contains the loader for these RAW assets
 */
export class AssetBank {

	// Separate this later
	readonly load: AssetLoadManager;
	readonly json = new Map<string, string>();
	readonly audio = new Map<string, HTMLAudioElement>();
	readonly image = new Map<string, HTMLImageElement>();
	constructor(assetBaseURL: string, fmodLoader?: FMODLoader) {
		this.load = new AssetLoadManager(assetBaseURL, this, fmodLoader);
	}

	/**
	 * Helper method for retrieving and parsing JSON.
	 */
	getJSONObject(key: string): any {
		const jsonStr = this.json.get(key);
		if (jsonStr)
			return JSON.parse(jsonStr);
		else
			return {};
	}
}