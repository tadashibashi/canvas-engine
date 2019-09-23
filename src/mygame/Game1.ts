import { Input, KeyCodes } from "../engine/input/types";
import { Game } from "../engine/Game";
import { TimerManager } from "../engine/timers/TimerManager";
import { GameConfig } from "../engine/types";
import { Player } from "./Player";
import { CollisionManager } from "../engine/physics/collisions/CollisionManager";
import { InputManager } from "../engine/input/InputManager";
import { AssetBank } from "../engine/assets/AssetBank";
import { GameTime } from "../engine/GameTime";
import { Ball } from "./Ball";
import { Atlas } from "../engine/graphics/Atlas";
import { Drawf } from "../engine/graphics/functions";
import { Brick } from "./Brick";
import { AtlasManager } from "../engine/graphics/AtlasManager";
import { AnimationManager } from "../engine/graphics/AnimationManager";

interface Controls {
    left: Input;
    right: Input;
    up: Input;
    down: Input
}
export class Game1 extends Game {
    readonly timers = new TimerManager(1);
    get controls(): Controls {
        return this._controls as Controls;
    }
    private _controls: Controls | undefined;

    get atlas(): Atlas {
        return this._atlas as Atlas;
    }
    private _atlas: Atlas | undefined;

	constructor(config: GameConfig) {
		super(config);

		let go1 = new Player(this.canvas.virtualWidth/2, this.canvas.virtualHeight - 10, 'green', 65, 10);
        let ball = new Ball(this.canvas.virtualWidth/2, this.canvas.virtualHeight/2, 4);
        const colls = new CollisionManager();

        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
                this.components.add(new Brick(i*64, j*16 + 1));
            }  
        }

        this.components
            .add(go1)
            .add(ball)
            .add(colls)
            
            .add(this.timers);
        this.services
            .add(colls)
	}

	initialization(input: InputManager) {
        this._controls = {
            left: input.keyboard.add(KeyCodes.LEFT_ARROW),
            right: input.keyboard.add(KeyCodes.RIGHT_ARROW),
            up: input.keyboard.add(KeyCodes.UP_ARROW),
            down: input.keyboard.add(KeyCodes.DOWN_ARROW)
        }
		super.initialization(input);
	}

	preload(assets: AssetBank) {
        assets.load.json('atlas', 'texturepacker_json.json');
        assets.load.image('images', 'images.json', true);
        assets.load.image('atlas', 'texturepacker_json.png');
		assets.load.audio('music', 'InterAct.mp3');

        super.preload(assets);
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
        super.create();
	}
    fontSize = 12;
	update(gameTime: GameTime) {
        super.update(gameTime);
        if (this.input.keyboard.justDown(this.controls.left)) {
            
            this.components.add(new Ball(this.canvas.virtualWidth/2, this.canvas.virtualHeight/2, 10));
        }  

    }

	draw(gameTime: GameTime) {
        this.canvas.guiCtx.clearRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
		this.canvas.pixelCtx.fillStyle = 'black';
        this.canvas.pixelCtx.fillRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
        
        // Drawf.frame(this.canvas.context, this.atlas, 'TL_Creatures', 200, 200);
        Drawf.text(this.canvas.guiCtx, {fillStyle: 'white', fontFamily: 'charybdis', text: Math.round(this.input.pointer.position.x) + ' ' + Math.round(this.input.pointer.position.y), fontSize: Math.floor(this.fontSize), position: {x: Math.round(this.input.pointer.position.x), y: Math.round(this.input.pointer.position.y)}
        });
		super.draw(gameTime);
	}
}