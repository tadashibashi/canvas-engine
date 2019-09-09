import { AssetLoader } from "./AssetLoader";

/**
 * Loads raw audio files as HTMLAudioElement's
 */
export class AudioLoader extends AssetLoader<HTMLAudioElement> {
  fetch (key: string, filepath: string): void {
  	// Create a new HTMLAudioElement
    let audio = new Audio(filepath);

    // Set the function to call back oncanplay
    audio.oncanplay = (ev) => this.onFileLoaded.send(audio, key, filepath);

    // Set the error message
    audio.onerror = (ev) => { throw new Error("Could not load audio file \"" + filepath +"\". Please check that the filepath is correct and that the file is compatible with browser.");}
    
    // Load file. To do: Sometimes file never is able to attain oncanplay status and breaks loading. Find out why.
    audio.load();
  }
}
