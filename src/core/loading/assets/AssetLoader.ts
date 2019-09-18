import { AssetLoadManager } from "./AssetLoadManager";
import { Delegate } from '../../Delegate';
import { Loader } from '../Loader';
 
/**
 * Private loader owned by AssetLoadManager for a particular indicated asset type
 */
export abstract class AssetLoader<T> extends Loader {
  
	/**
	 * Contains an array of config objects that indicate what files to load.
	 */
  protected toLoad: {key: string, filepath: string}[] = [];
  /**
   * Contains an array of config objects that indicate what JSON files will batch load assets.
   */
  protected toLoadViaJSON: {key: string, filepath: string}[] = [];
  
  /**
   * Counter that marks how many files are currently loading
   */
  protected filesLoading = 0;

  /**
   * Event to subscribe to. Fires when a file has loaded.
   */
  readonly onFileLoaded = new Delegate<(item: T, key: string, filepath: string) => void>();

  constructor(public manager: AssetLoadManager, public cache: Map<string, T>, public subURL: string) {
  	super();
  	this.onFileLoaded.subscribe(this, this.onFileLoadedHandler);
  }

  /**
   * Queues a file to be loaded prior to when load() is called
   * @param key Key to reference this file to be loaded
   * @param filepath Filepath desired to load this file
   * @param viaJSON whether or not this is a path to a JSON file for batch loading 
   * Target JSON file must be in the format of {key: string, filepath: string}[]
   */
  queue = (key: string, filepath: string, viaJSON: boolean): void => {
    if (viaJSON) {
      this.manager.json(key, filepath);
      this.toLoadViaJSON.push({key: key, filepath: filepath});
    } else {
      this.toLoad.push({key: key, filepath: filepath});
    }   
  }

  /**
   * Returns a number 0 to 1 representing percentage of files loaded
   */
  getloadProgress(): number {
    return (this.toLoad.length - this.filesLoading)/this.toLoad.length;
  }

  /**
   * Initiates loading for this AssetLoader. Called by AssetLoadManager.
   */
  load = (): void => {
  	// Pop in JSON keys to the toLoad queue if there are any
    if (this.toLoadViaJSON.length > 0) {
    	this.loadViaJSON();
    }
    let toLoad = this.toLoad;
    let cache = this.cache;
    // Load each file in the toLoad queue
    toLoad.forEach((data) => {
    	// Check that our designated cache does not already have key
      if (!cache.has(data.key)) { 
      	// Initiate file loading
        this.filesLoading += 1; // Increase the currently loading counter by one
        this.fetch(data.key, this.manager.baseURL + this.subURL + data.filepath);
      } else {
      	if (this.isDebug) {
        	console.log("The key,", data.key, "is already cached. Cancelling loading this file" + data.key);
      	}
      }
    });
    // If filesLoading is zero, this means no files were were loaded
    if (this.filesLoading === 0) { 
    	// Broadcast the fact we have finished loading (manager should subscribe to this)
      this.onLoadFinish.send();
    }
  } 

  protected loadViaJSON() {
  	let toLoad = this.toLoad; 
  	let toLoadViaJSON = this.toLoadViaJSON;
  	let jsonCache = this.manager.assets.json;
  	this.filesLoading = 0; // Reset file counter just in case
  	toLoadViaJSON.forEach((jsonConfig) => {
  		const jsonString = jsonCache.get(jsonConfig.key);
  		if (jsonString) {
  	  	let json: {key: string, filepath: string}[] = JSON.parse(jsonString);
  	  	json.forEach((config) => {
  	    	toLoad.push({key: config.key, filepath: config.filepath});
  	  	});
  	  } else {
  	  	throw new Error('JSON Cache does not contain an element with key: ' + jsonConfig.key + '! Failed to load assets via JSON!');
  	  }
  	});
  }



  /**
   * This loader's unique utility for getting and loading its type of files.
   * @param key Key for easy reference
   * @param filepath Filepath to load
   */
  protected abstract fetch(key: string, filepath: string): void;

  /**
   * Callback when file finishes loading
   * @param item Item procured
   * @param key Key that was given
   * @param filepath Filepath where item was found
   */
  private onFileLoadedHandler = (item: T, key: string, filepath: string): void => {
    console.log('Loaded', item, '"'+key+'"', 'at:', filepath);
    this.cache.set(key, item); // load file in the cache
    this.filesLoading --; // subtract from file counter
    // If all files are finished
    if (this.filesLoading === 0) {
      this.toLoad = []; // reset load queue
      // Broadcast the fact we have finished loading (manager should subscribe to this)
      this.onLoadFinish.send();
    }
  }
}