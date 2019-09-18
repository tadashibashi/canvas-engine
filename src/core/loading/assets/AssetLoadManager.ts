import { Game } from "../../../components/game/Game";
import { StateMachine } from "../../../components/states/StateMachine";

import { JSONLoader } from "./JSONLoader";
import { ImageLoader } from "./ImageLoader";
import { AudioLoader } from "./AudioLoader";

import { Delegate } from '../../Delegate';
import { Loader } from '../Loader';
import { FMODLoader } from '../fmodstudio/FMODLoader';
import { State } from '../../../components/states/State';

/**
 * Something that holds the data store for assets
 */
export interface IAssetBank {
	json: Map<string, string>;
	images: Map<string, HTMLImageElement>;
	audio: Map<string, HTMLAudioElement>;
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
	  this.imageLoader = new ImageLoader(this, assets.images, 'images/');
	  this.audioLoader = new AudioLoader(this, assets.audio, 'audio/');

	  // Attach callbacks
		this.jsonLoader.onLoadFinish.subscribe(this, this.finishedLoadingAssetType);
		this.imageLoader.onLoadFinish.subscribe(this, this.finishedLoadingAssetType);
		this.audioLoader.onLoadFinish.subscribe(this, this.finishedLoadingAssetType);
		if (fmodLoader) {
			fmodLoader.onLoadFinish.subscribe(this, () => {
				this.fmodFinished = true;
			});
		}

    this.states = new StateMachine(this);
    this.states.add('json')
      .on('enter', this.jsonLoader.load);

    this.states.add('images')
      .on('enter', this.imageLoader.load);

    this.states.add('audio')
      .on('enter', this.audioLoader.load);

    this.states.add('finished')
      .on('enter', this.checkFMOD);
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
}