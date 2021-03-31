import { Game } from "../engine/Game";
import { GameConfig } from "../engine/types";
import { GameTime } from "../engine/GameTime";
import { Drawf } from "../engine/graphics/functions";
import { AtlasManager } from "../engine/graphics/AtlasManager";
import { AnimationManager } from "../engine/graphics/AnimationManager";
import { Scene } from "../engine/scenes/Scene";
import { KeyCodes } from "../engine/input/types/KeyCodes";


export class Game1 extends Game {
	constructor(config: GameConfig) {
        super(config);
        const gradient = this.canvas.backgroundCtx.createLinearGradient(0, 0, 0, this.canvas.virtualHeight)
        let i = 0;
        while (i < .9) {
            i += .1;
            gradient.addColorStop(i, Drawf.rgb(Math.random()*255, Math.random()*255, i*255));
        }
        this.scenes.addScene(new Scene('hello', 'yo', gradient));
    } 


	preload() {
        this.load.json('atlas', 'texturepacker_json.json');
        this.load.image('images', 'images.json', true);
        this.load.image('atlas', 'texturepacker_json.png');
		this.load.audio('music', 'InterAct.mp3');
	}

    create() {     
        const atlasses = this.services.get(AtlasManager);
        const anims = this.services.get(AnimationManager);
        atlasses.create('masterAtlas', 'atlas', 'atlas');
        anims.createFromAtlas({
            key: 'guy',
            atlas: atlasses.get('masterAtlas'),
            baseFps: 10,
            frameKeys: anims.makeFrameKeys('creatures/guy/', '', 1, 4)
        });
        anims.createFromAtlas({
            key: 'guyShocked',
            atlas: atlasses.get('masterAtlas'),
            baseFps: 10,
            frameKeys: ['creatures/guy/5']
        });
        anims.createFromAtlas({
            key: 'brick',
            atlas: atlasses.get('masterAtlas'),
            baseFps: 10,
            frameKeys: ['bricks/1']
        });
        this.scenes.start('hello', true);
        super.create();
    }
    
	update(gameTime: GameTime) {
        super.update(gameTime);
        if (this.input.keyboard.justDown(this.input.keyboard.add(KeyCodes.A))) {
            this.scenes.start('hello');
        }
    } 

	draw(gameTime: GameTime) {
        super.draw(gameTime);   
	}
}