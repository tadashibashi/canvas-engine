import { Input, KeyCodes } from "../engine/input/types";
import { Game } from "../engine/Game";
import { TimerManager } from "../engine/timers/TimerManager";
import { GameConfig } from "../engine/types";
import { Player } from "./Player";
import { CollisionManager } from "../engine/physics/collisions/CollisionManager";
import { InputManager } from "../engine/input/InputManager";
import { GameTime } from "../engine/GameTime";
import { GrowingCircle } from "./GrowingCircle";
import { Mathf } from "../engine/math/functions";

export class Game2 extends Game {
    static colorRange = {
        r: 0,
        g: 100,
        b: 200
    };
    readonly timers = new TimerManager(1);
	constructor(config: GameConfig) {
		super(config);

		let go1 = new Player(10, 10, 100, 100);
		let go2 = new Player(200, 200, 100, 100);
		
		go1.transform.children.add(go2.transform);

        const colls = new CollisionManager();
        colls.set(go1, go2)
            .on('enter', (obj1, obj2) => {
                console.log('I entered!');
            })
            .on('collide', (obj1, obj2) => {
                console.log('I collided!!!');
            })
            .on('exit', (obj1, obj2) => {
                console.log('I exited!');
            });

        this.components
            .add(go1)
            .add(go2)
            .add(colls)
            .add(this.timers);
	}

	preload() {
		this.load.image('images', 'images.json', true);
		this.load.audio('music', 'InterAct.mp3');

        super.preload();
	}

  create() {
      super.create();
      
		
	}
    dir = {
        r: 1,
        g: -1,
        b: 1
    };
    pos = {
        x: 0,
        y: 0
    }
    static direction = 0;
	update(gameTime: GameTime) {
        super.update(gameTime);
        this.updateGrowingCircle();
        
    }
    updateGrowingCircle() {

        Game2.direction = Mathf.wrap(Game2.direction + .1, 0, 360);
        
        if (Game2.colorRange.r > 200) {
            Game2.colorRange.r = 200;
            this.dir.r = -1;
        }
        if (Game2.colorRange.r < 0) {
            Game2.colorRange.r = 0;
            this.dir.r = 1;
        }
        if (Game2.colorRange.g > 200) {
            Game2.colorRange.g = 200;
            this.dir.g = -1;
        }
        if (Game2.colorRange.g < 0) {
            Game2.colorRange.g = 0;
            this.dir.g = 1;
        }
        if (Game2.colorRange.b > 200) {
            Game2.colorRange.b = 200;
            this.dir.b = -1;
        }
        if (Game2.colorRange.b < 0) {
            Game2.colorRange.b = 0;
            this.dir.b = 1;
        }
        Game2.colorRange.r += (.1*this.dir.r);
        Game2.colorRange.g += (.1*this.dir.g);
        Game2.colorRange.b += (.1*this.dir.b);
    }
    createGrowingCircleRand(toAttach?: GrowingCircle) {
        let x = Math.random() * this.canvas.virtualWidth;
        let y = Math.random() * this.canvas.virtualHeight;
        const circ = new GrowingCircle(this.canvas.virtualWidth/2 + this.pos.x, this.canvas.virtualHeight/2 + this.pos.y, 10, Math.random() * 50 + Game2.colorRange.r + 50, Math.random() * 50 + Game2.colorRange.g + 100, Math.random() * 50 + Game2.colorRange.b + 150);
        this.components.add(circ);
        if (toAttach) {
            toAttach.transform.children.add(circ.transform);
        }
    }

	draw(gameTime: GameTime) {
		// this.canvas.context.fillStyle = 'black';
		// this.canvas.context.fillRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
		super.draw(gameTime);
	}
}