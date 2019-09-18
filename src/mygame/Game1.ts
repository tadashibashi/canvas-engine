import { Game } from '../components/game/Game';
import { GameTime } from '../core/GameTime';
import { GameConfig } from '../components/game/GameConfig';
import { InputManager } from '../components/input/InputManager';
import { AssetManager } from '../core/AssetManager';
import { Player } from './Player';
import { TimerManager } from '../components/timers/TimerManager';
import { CollisionManager } from '../components/colliders/CollisionManager';
import { KeyCodes, Input } from '../components/input/types/Types';
import { Draw } from '../core/Draw';
import { Ball } from './Ball';

interface Controls {
    left: Input;
    right: Input;
}
export class Game1 extends Game {
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
        colls.add(go1, go2)
            .events
            .on('enter', this, (obj1, obj2) => {
                console.log('I entered!');
            })
            .on('collide', this, (obj1, obj2) => {
                console.log('I collided!!!');
            })
            .on('exit', this, (obj1, obj2) => {
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
        }
		super.initialization(input);
	}

	preload(assets: AssetManager) {
		assets.load.image('images', 'images.json', true);
		assets.load.audio('music', 'InterAct.mp3');

        super.preload(assets);
	}

    awake() {
        super.awake();

		const engine = this.fmod;

		//engine.playOneShot('event:/Silence');
        
		let outval: any = {};
		engine.core.createSound('bank.fsb', FMOD.MODE.LOOP_NORMAL, null, outval);
		let bank = outval.val as FMOD.Sound;
        this.timers.fireAndForget(() => {
            console.log('timer went off');
            let inst = engine.createProgrammerInstance('event:/Programmer', (props) => {
                bank.getSubSound(0, outval);
                let snd = outval.val as FMOD.Sound;
                props.sound = snd;
                if (props.name === 'Hello') {
                    inst.setPitch(2);
                }
                if (props.name === 'World') {
                    inst.setPitch(.5);
                }
                console.log(props.name);
            });
            engine.createInstance('event:/Music').start().setParameter('Intensity', 1);
            this.timers.fireAndForget(() => {
                console.log('EHEHEHEHEH');
                this.timers.fireAndForget(() => {
                    console.log('MUWAHAHAHA');
                }, 1);
            }, 1);
            //inst.start();
        }, 60*2, false);

		
	}

	update(gameTime: GameTime) {
        super.update(gameTime);

        let a = this.controls.left;
        let balls = this.components.getByTag('ball');
        if (a.axis !== 0 && balls.length < 50) {
            this.components.add(new Ball(Math.random() * this.canvas.virtualWidth, Math.random() * this.canvas.virtualHeight, 10, Draw.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255)));
        }
	}

	draw(gameTime: GameTime) {
		this.canvas.context.fillStyle = 'black';
		this.canvas.context.fillRect(0, 0, this.canvas.virtualWidth, this.canvas.virtualHeight);
		super.draw(gameTime);
	}
}