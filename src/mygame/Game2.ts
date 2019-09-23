import { Input, KeyCodes } from "../engine/input/types";
import { Game } from "../engine/Game";
import { TimerManager } from "../engine/timers/TimerManager";
import { GameConfig } from "../engine/types";
import { Player } from "./Player";
import { CollisionManager } from "../engine/physics/collisions/CollisionManager";
import { InputManager } from "../engine/input/InputManager";
import { AssetBank } from "../engine/assets/AssetBank";
import { GameTime } from "../engine/GameTime";
import { GrowingCircle } from "./GrowingCircle";
import { Drawf } from "../engine/graphics/functions";
import { Mathf } from "../engine/math/functions";

interface Controls {
    left: Input;
    right: Input;
    up: Input;
    down: Input
}
export class Game2 extends Game {
    static colorRange = {
        r: 0,
        g: 100,
        b: 200
    };
    readonly timers = new TimerManager(1);
    get controls(): Controls {
        return this._controls as Controls;
    }
    private _controls: Controls | undefined;
	constructor(config: GameConfig) {
		super(config);

		let go1 = new Player(10, 10, 'green', 100, 100);
		let go2 = new Player(200, 200, 'orange', 100, 100);
		
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
		assets.load.image('images', 'images.json', true);
		assets.load.audio('music', 'InterAct.mp3');

    super.preload(assets);
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
        const controls = this.controls;
        const pos = this.pos;
        if (controls.left.axis === 1) {
            console.log('left');
            pos.x -= 1;
            Game2.direction = 0;
        }
        if (controls.right.axis === 1) {
            console.log('right');
            pos.x += 1;
            Game2.direction = 180;
        }
        if (controls.up.axis === 1) {
            console.log('up');
            pos.y -= 1;
            Game2.direction = 90;
        }
        if (controls.down.axis === 1) {
            console.log('down');
            pos.y += 1;
            Game2.direction = 270;
        }
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
        let a = this.controls.left;
        let balls = this.components.getByTag('growCirc');
        if (a.axis !== 0 && balls.length < 25) {
            this.createGrowingCircleRand();
        }
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