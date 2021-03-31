import { Game } from "../../Game";
import { AssetBank } from "../../assets/AssetBank";
import { DrawableComponent } from "../../DrawableComponent";
import { GameTime } from "../../GameTime";

/*
TileMap will need 
- list of layers
will inject the layers into the scene's drawable components

*/

export class TileMap {

    awake() {
        Game.engine.services.get(AssetBank);
    }
}

export class TileMapLayer extends DrawableComponent {

    create() {};

    draw(gameTime: GameTime) {
        
    }
    update(gameTime: GameTime) {
        
    }
}