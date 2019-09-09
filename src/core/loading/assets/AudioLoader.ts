import { AssetLoader } from "./AssetLoader";
interface ElementBundle<T> {
	key: string;
	filepath: string;
	element: T;
}
/**
 * Loads raw audio files as HTMLAudioElement's
 */
export class AudioLoader extends AssetLoader<HTMLAudioElement> {
	/**
	 * Overrides parent in that it returns the audio element for interval onload checking
	 */
  fetch (key: string, filepath: string): ElementBundle<HTMLAudioElement> {
  	// Create a new HTMLAudioElement
    const audio = document.createElement('audio') as HTMLAudioElement;

    console.log('starting to load ' + filepath);
    // Set the function to call back oncanplay

    const canPlayHandler = () => {
    	this.onFileLoaded.send(audio, key, filepath);
    };

    //audio.addEventListener('canplay', canPlayHandler);

    audio.preload = 'none';
    // Set the error message
    audio.onerror = (ev) => { 
    	throw new Error("Could not load audio file \"" + filepath +"\". Please check that the filepath is correct and that the file is compatible with browser.");
    }

    audio.src = filepath;
    audio.load();

    return {element: audio, key: key, filepath: filepath};
  }

  /**
   * Initiates loading for this AssetLoader. Called by AssetLoadManager. OVERRIDE: Modified to check for load via setInterval
   */
  load = (): void => {
  	// 1. Get the file queue ready

  	// Pop in JSON keys to the toLoad queue if there are any
    if (this.toLoadViaJSON.length > 0) {
    	this.loadViaJSON();
    }

    // 2. Create the HTML Audio Elements with respective keys and filepaths
    let toLoad = this.toLoad;
    let cache = this.cache;
    let audios: ElementBundle<HTMLAudioElement>[] = [];
    // Load each file in the toLoad queue
    toLoad.forEach((data) => {
    	// Check that our designated cache does not already have key
      if (!cache.has(data.key)) { 
      	// Initiate file loading
        this.filesLoading += 1; // Increase the currently loading counter by one
        audios.push(this.fetch(data.key, this.manager.baseURL + this.subURL + data.filepath));
      } else {
      	if (this.isDebug) {
        	console.log("The key,", data.key, "is already cached. Cancelling loading this file" + data.key);
      	}
      }
    });

    // 3. Check to see if all are loaded via setInterval
    
    // If filesLoading is zero, this means no files were were loaded
    if (this.filesLoading === 0) { 
    	// Broadcast the fact we have finished loading (manager should subscribe to this)
      this.onLoadFinish.send();
    } else {
    	// Check load state via an interval (Edge compatibility, does not support oncanplay)
    	const interval = setInterval(()=>{
    		let ready = true;
    		audios.forEach((audio) => {
    			if (audio.element.readyState < 4) {
    				ready = false;
    			}
    		});
    		if (ready) {
    			clearInterval(interval);
    			audios.forEach((audio) => {
    				this.onFileLoaded.send(audio.element, audio.key, audio.filepath);
    			});
    		}
    	}, 100);
    }
  } 
}
