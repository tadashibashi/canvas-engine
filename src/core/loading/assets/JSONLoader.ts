import { AssetLoader } from "./AssetLoader";

/**
 * Loads JSON files
 */
export class JSONLoader extends AssetLoader<string> {
	/**
	 * Queues a file to be loaded when load() is called. Overrides parent.
	 * @param key Key to reference this file to be loaded
	 * @param filepath Filepath desired to load this file
	 */
	queue = (key: string, filepath: string): void => {
	  this.toLoad.push({key: key, filepath: filepath}); 
	}

  fetch (key: string, filepath: string): void {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filepath, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == 200) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        this.onFileLoaded.send(xobj.responseText, key, filepath);
      }
    };
    xobj.send(null); 
  }
}