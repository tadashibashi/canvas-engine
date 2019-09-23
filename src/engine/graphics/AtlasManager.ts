import { Atlas } from ".";
import { TexturePackerJSON } from "./types";
import { AssetBank } from "../assets/AssetBank";

export class AtlasManager {
  private atlasses = new Map<string, Atlas>();

  constructor(private assetBank: AssetBank) {
    
  }
  
  /**
   * Creates and adds an Atlas to this manager
   * @param key 
   * @param image 
   * @param config 
   */
  create(key: string, imageKey: string, texturePackerJSONKey: string) {
    const jsonStr = this.assetBank.json.get(texturePackerJSONKey);
    let config: TexturePackerJSON;
    if (jsonStr) {
      config = JSON.parse(jsonStr) as TexturePackerJSON;
    } else {
      throw new Error('Error when creating Atlas! TexturePackerJSON of key "' + texturePackerJSONKey + '", does not exist!');
    }
    const img = this.assetBank.image.get(imageKey);
    if (img) {
      this.atlasses.set(key, new Atlas(img, config));
    } else {
      throw new Error('Error when creating Atlas! Image of key"' + imageKey + '", does not exist!');
    }
  }
  get(key: string): Atlas {
    const atlas = this.atlasses.get(key);
    if (atlas) {
      return atlas;
    } else {
      throw new Error('AtlasManager Error! Atlas of key "' + key + '", does not exist in this manager!');
    }
  }

}