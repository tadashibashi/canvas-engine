import { AssetLoader } from "./AssetLoader";

/**
 * Loads raw images in HTMLImageElement's
 */
export class ImageLoader extends AssetLoader<HTMLImageElement> {
  fetch (key: string, filepath: string): void {
    // Create a new HTMLImageElement
    let img = new Image();
    
    // The callback to send onload
    img.onload = (ev) => this.onFileLoaded.send(img, key, filepath);
    
    // The image file to load
    img.src = filepath;

    // The error to send
    img.onerror = (ev) => { 
    	throw new Error("Could not load image \"" + filepath + 
    		"\". Please check that the filepath is correct.");
    }
  }
}