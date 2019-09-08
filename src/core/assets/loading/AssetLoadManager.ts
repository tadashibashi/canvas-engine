import { Game } from "../../../components/game/Game";
import { StateMachine } from "../../../components/states/StateMachine";

import { JSONLoader } from "./JSONLoader";
import { ImageLoader } from "./ImageLoader";
import { AudioLoader } from "./AudioLoader";
import { AssetManager } from '../AssetManager';
import { Delegate } from '../../Delegate';

export interface IAssetBank {
	json: Map<string, string>;
	images: Map<string, HTMLImageElement>;
	audio: Map<string, HTMLAudioElement>;
}

export class AssetLoadManager {
  isLoading: boolean = false;
  readonly initState = 'json';
  states: StateMachine<'json' | 'images' | 'audio' | 'finished'>;

  private onLoadFinish = new Delegate<()=>void>();

  // Loaders
  /**
   * JSON loader loads json files and turns them into strings that can be parsed into objects.
   * This comes first, to allow other asset types to load via json files.
   */
  private jsonLoader: JSONLoader; 
  private imageLoader: ImageLoader;
  private audioLoader: AudioLoader;

  /**
   * 
   */
  constructor(public baseURL: string, assets: IAssetBank) {
	  this.jsonLoader = new JSONLoader(this, assets.json, 'json/');
	  this.imageLoader = new ImageLoader(this, assets.images, 'images/');
	  this.audioLoader = new AudioLoader(this, assets.audio, 'audio/');

	  // Attach callbacks
		this.jsonLoader.onFinishedLoading.subscribe(this, this.finishedLoadingAssetType);
		this.imageLoader.onFinishedLoading.subscribe(this, this.finishedLoadingAssetType);
		this.audioLoader.onFinishedLoading.subscribe(this, this.finishedLoadingAssetType);

    this.states = new StateMachine(this);
    this.states.add('json')
      .on('enter', this.jsonLoader.load);

    this.states.add('images')
      .on('enter', this.imageLoader.load);

    this.states.add('audio')
      .on('enter', this.audioLoader.load);

    this.states.add('finished')
      .on('enter', this.finishLoading);
  }

  // PUBLIC API
  /**
   * Starts the loading process
   */
  load () {
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
  private finishLoading() {
    console.log('Finished Loading all files!');
    this.onLoadFinish.send();
    this.isLoading = false;
  }
  
  /**
   * This is a handler that is called when an asset type has finished loading
   * It prescribes the order of the next asset type that will then begin loading.
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