import { IUpdatable, IDrawable } from "./types/interfaces";
import { ComponentManager } from "./ComponentManager";
import { GameTime } from "./GameTime";
import { GameConfig } from "./types";
import { TypeContainer } from "./utility/TypeContainer";
import { AssetBank } from "./assets/AssetBank";
import { Canvas } from "./utility/Canvas";
import { InputManager } from "./input/InputManager";
import { FMODEngine } from "./audio/fmodstudio/FMODEngine";
import { FMODLoader } from "./audio/fmodstudio/FMODLoader";
import { Tweener } from "./tweens/Tweener";

export class Game implements IUpdatable, IDrawable {

	static engine: Game;

	protected components: ComponentManager;
	private readonly gameTime: GameTime;
	public readonly config: GameConfig;
	public readonly services: TypeContainer;

	protected get assets(): AssetBank {
		return this._assets as AssetBank;
	}
	protected _assets: AssetBank | undefined;

	protected get canvas(): Canvas {
		return this._canvas as Canvas;
	}
	protected _canvas: Canvas | undefined;

	protected get input(): InputManager {
		return this._input as InputManager;
	}
	protected _input: InputManager | undefined;

	protected get fmod(): FMODEngine {
		return this._fmod as FMODEngine;
	}
	protected _fmod: FMODEngine | undefined;

	constructor(config: GameConfig) {
		Game.engine = this;

		this.config = config;
		this.gameTime = new GameTime();
		this.services = new TypeContainer();	
		
		this.components = new ComponentManager();
		this._canvas = new Canvas('#' + config.canvasID, config.width, config.height);
		this._input = new InputManager();


		let fmodLoader: FMODLoader | undefined;

		if (config.audio && config.audio.fmodConfig) {
			// Async loading since the game logic should start without 
			// needing interaction from audio workaround.
			// Test sound needs interaction in order to test and load
			// we can have some kind of lobby-like place to wait for 
			// user interaction.
			fmodLoader = new FMODLoader(config.audio.fmodConfig);
			fmodLoader.onLoadFinish.subscribe(this, (system, fmod) => {
				this._fmod = new FMODEngine(fmod, system);
				this.services.add(this._fmod);
				this.components.add(this._fmod);
			});
			fmodLoader.load();
		}

		this._assets = new AssetBank('public/', fmodLoader);

        const tweener = new Tweener();
		
        this.services
            .add(this._canvas)
            .add(this._input)
            .add(this._assets)
            .add(tweener);

        this.components
            .add(this._input)
            .add(tweener);

	}


	// ============ INITIALIZATION ========================
	
	init() {
		this.initialization(this.input);
	}

	/**
	 * Set inputs here
	 */
	protected initialization(input: InputManager) {
		this.preload(this.assets);
	}

	protected preload(assets: AssetBank) {
		assets.load.onLoadFinish.subscribe(this, this.awake);
		assets.load.load();
	}

	// ============ EVENT HANDLERS ========================
	private run = (time: number) => {
		window.requestAnimationFrame(this.run);
		let gameTime = this.gameTime;	
        gameTime.update(time);
        this.preUpdate(gameTime);
		this.update(gameTime);
		this.draw(gameTime);	
	}

	awake() {
		this.components.awake();
		this.run(0);
	}

	preUpdate(gameTime: GameTime) {
		this.components.preUpdate(gameTime);	
	}

	update(gameTime: GameTime) {
		this.components.update(gameTime);	
	}

	draw(gameTime: GameTime) {
		this.components.draw(gameTime);
	}
}
