import { Loader } from "./Loader";
import { StateMachine } from "../../states/StateMachine";
import { JSONLoader } from "./JSONLoader";
import { ImageLoader } from "./ImageLoader";
import { AudioLoader } from "./AudioLoader";
import { FMODLoader } from "../../audio/fmodstudio/FMODLoader";
import { Atlas } from "../../graphics";

/**
 * Something that holds the data store for assets
 */
export interface IAssetBank {
	json: Map<string, string>;
	image: Map<string, HTMLImageElement>;
  audio: Map<string, HTMLAudioElement>;
  atlas: Map<string, Atlas>;
}

export class AssetLoadManager extends Loader {
  isLoading: boolean = false;
  readonly initState = 'json';
  readonly states: StateMachine<'json' | 'images' | 'audio' | 'finished'>;

  // Loaders
  /**
   * JSON loader loads json files and turns them into strings that can be parsed into objects.
   * This comes first, to allow other asset types to load via json files.
   */
  private jsonLoader: JSONLoader; 
  private imageLoader: ImageLoader;
  private audioLoader: AudioLoader;

 	public fmodFinished = false;

  /**
   * @param baseURL The path to the asset root folder
   * @param assets The object that holds the asset caches. Allows loaders to store data.
   */
  constructor(public baseURL: string, public assets: IAssetBank, private fmodLoader?: FMODLoader) {
	  super();
	  this.jsonLoader = new JSONLoader(this, assets.json, 'json/');
	  this.imageLoader = new ImageLoader(this, assets.image, 'images/');
	  this.audioLoader = new AudioLoader(this, assets.audio, 'audio/');

	  // Attach callbacks
		this.jsonLoader.onLoadFinish.subscribe(this.finishedLoadingAssetType, this);
		this.imageLoader.onLoadFinish.subscribe(this.finishedLoadingAssetType, this);
		this.audioLoader.onLoadFinish.subscribe(this.finishedLoadingAssetType, this);
		if (fmodLoader) {
			fmodLoader.onLoadFinish.subscribe(() => {
				this.fmodFinished = true;
			}, this);
		}

    this.states = new StateMachine(this);
    this.states.add('json')
      .on('enter', this.jsonLoader.load, this.jsonLoader);

    this.states.add('images')
      .on('enter', this.imageLoader.load, this.imageLoader);

    this.states.add('audio')
      .on('enter', this.audioLoader.load, this.audioLoader);

    this.states.add('finished')
      .on('enter', this.checkFMOD, this);
  }

  // PUBLIC API
  /**
   * Starts the loading process
   */
  load = () => {
    this.isLoading = true;
    this.states.start(this.initState); // first state in the chain
  }

  /**
   * Queues a JSON file for loading.
   * @param key key of the file to load
   * @param filepath filepath of the file to load
   */
  json(key: string, filepath: string) {
    this.jsonLoader.queue(key, filepath);
  }
  
  /**
   * Queues an image file for loading.
   * @param key key of the file to load
   * @param filepath filepath of the file to load
   */
  image(key: string, filepath: string, viaJSON = false) {
    this.imageLoader.queue(key, filepath, viaJSON);
  }

  /**
   * Queues an audio file for loading.
   * @param key key of the file to load
   * @param filepath filepath of the file to load
   */
  audio(key: string, filepath: string, viaJSON = false) {
    this.audioLoader.queue(key, filepath, viaJSON);
  }

  // ============ Private Event Handlers ===================
  /**
   * Fires when assets are finished loading
   */ 
  private finishLoading = () => {
    console.log('Finished Loading all files!');
    this.loadWrappers();
    this.onLoadFinish.send();
    this.isLoading = false;
  }
  
  private checkFMOD = () => {
  	if (this.fmodLoader) {
  		let checkFMODInterval = setInterval(() => {
  			if (this.fmodFinished) {
  				this.finishLoading();
  				clearInterval(checkFMODInterval);
  			}
  		}, 100);
  	} else {
  		this.finishLoading();
  	}
  }
  /**
   * This is a handler that is called when an asset type has finished loading
   * It prescribes the order of the asset type that will begin loading next.
   */
  private finishedLoadingAssetType = (): void => {
    switch(this.states.currentKey) {
      case 'json': this.states.start('images');
      break; 
      case 'images': this.states.start('audio');
      break;
      case 'audio': this.states.start('finished');
      break;
    }
  }

  loadWrappers = () => {

  }
}