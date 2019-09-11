import { DrawableComponent } from '../DrawableComponent';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { TypeContainer } from '../../core/TypeContainer';
import { InputManager } from '../input/InputManager';
import { Pointer } from '../input/sources/Pointer';
import { PointerCodes, Input, KeyCodes } from '../input/types/Types';
import { Canvas } from '../../core/Canvas';
import { Keyboard } from '../input/sources/Keyboard';
import { GraphicRenderer } from '../graphics/GraphicRenderer';
import { Draw } from '../../core/Draw';
import { Transform } from '../transform/Transform';
import { AssetManager } from '../../core/AssetManager';
import { FMODLoader } from '../../core/loading/fmodstudio/FMODLoader';
import { IFMOD } from '../../libraries/IFMOD/IFMOD';
import { FMODEngine } from '../audio/FMODEngine';

export interface GameConfig {
	readonly canvasID: string;
	readonly width?: number;
	readonly height?: number;
	readonly backgroundColor?: string;
	readonly pixelated: boolean
}

export class Game extends DrawableComponent {
	static engine: Game;
	readonly services: TypeContainer;
	protected readonly components: ComponentManager;

	fmod: FMODEngine;
	left: Input;
	right: Input;
	fontSize = 1;
	loadFinish = false;
	constructor(public readonly config: GameConfig) {
		super();
		Game.engine = this;

		this.initFMOD();

		let canvas = new Canvas('#' + config.canvasID, config.width, config.height, config.backgroundColor);
		let input = new InputManager();

		let gr = new GraphicRenderer();
		gr.setAnchor(-200, -100);
		gr.drawOrder = -100;
		gr.update = (gameTime: GameTime) => {
			this.fontSize += gameTime.deltaSec;
		} 
		gr.draw = (gameTime: GameTime) => {

			gr.start();

			Draw.circ(canvas.context, {x: -gr.anchor.x, y: -gr.anchor.y, r:100}, 'gray', 'blue');
			Draw.text(canvas.context, {
				fillStyle: 'orange',
				fontFamily: 'Georgia',
				fontSize: this.fontSize,
				position: {x: -gr.anchor.x, y: -gr.anchor.y},
				text: this.fontSize.toString(),
				textAlign: 'left'
			});
			gr.end();
		}

		let assets = new AssetManager('public/');
		assets.load.onLoadFinish.subscribe(this, this.awake);
		assets.load.image('images', 'images.json', true);
		assets.load.audio('music', 'InterAct.mp3');
		assets.load.load();

		this.services = new TypeContainer()
			.set(canvas)
			.set(input)
			.set(assets);

		this.components = new ComponentManager()
			.add(input)
			.add(gr) //just testing gr and new Transform
			.add(new Transform(100, 100, 10));
	} 

	// ============ INITIALIZATION ========================
	private initFMOD() {
		let fmodLoader = new FMODLoader({
			assetBaseURL: 'public/audio/',
			maxChannels: 128,
			totalMemory: 64 * 1024 * 1024,
			initFlags: IFMOD.INITFLAGS.NORMAL,
			studioInitFlags: IFMOD.STUDIO_INITFLAGS.NORMAL,
			preloadFileData:
			[
				{
					directory: '/',
					fileNames: ['Master Bank.bank', 'Master Bank.strings.bank'],
					url: 'banks/'
				}
			],
			initLoadBanks: 
			[
				{ 
					names:['Master Bank.bank', 'Master Bank.strings.bank'],
					flags: IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL
				}
			],
			soundTestEvent: '{d8502bb9-8601-4625-a90a-3498d165b1d0}'
		});
		fmodLoader.onLoadFinish.subscribe(this, (system) => {
			this.fmod = new FMODEngine(system);
			this.fmod.playOneShot('event:/Gallia');
		});
		fmodLoader.load();
	}
	// ============ EVENT HANDLERS ========================
	awake() {
		super.awake();
		this.left = this.services.get(InputManager).keyboard.add(KeyCodes.A);
		this.right = this.services.get(InputManager).keyboard.add(KeyCodes.D);
		this.components.awake();

		//let assets = this.services.get(AssetManager);
		//assets.audio.get('music').play();
		this.loadFinish = true;
	}

	update(gameTime: GameTime) {
		if (!this.loadFinish) return;


		let input = this.services.get(InputManager);
		let keyboard = input.sources.get(Keyboard);
		input.preUpdate(gameTime);
		
		//console.log(pointer.position.x, pointer.position.lastX);
		if (this.left.axis === 1) {
			this.canvas.context.translate(1, 0);
		}
		if (this.right.axis === 1) {
			this.canvas.context.translate(-1, 0);
		}
		if (keyboard.justUp(this.left)) {
			console.log('just released left');
		}

		this.components.update(gameTime);	
		if (this.fmod) this.fmod.update(gameTime);
	}

	draw(gameTime: GameTime) {
		if (!this.loadFinish) return;

		let canvas = this.canvas;
		let context = canvas.context;
		context.fillStyle = canvas.backgroundColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		this.components.draw(gameTime);
	}
}
