import { IUpdatable, IDrawable } from "./types/interfaces";
import { ComponentManager } from "./ComponentManager";
import { GameTime } from "./GameTime";
import { GameConfig } from "./types";
import { TypeContainer } from "./utility/TypeContainer";
import { AssetBank } from "./assets/AssetBank";
import { Canvas } from "./Canvas";
import { InputManager } from "./input/InputManager";
import { FMODEngine } from "./audio/fmodstudio/FMODEngine";
import { FMODLoader } from "./audio/fmodstudio/FMODLoader";
import { Tweener } from "./tweens/Tweener";
import { AnimationManager } from "./graphics/AnimationManager";
import { AtlasManager } from "./graphics/AtlasManager";

export class Game implements IUpdatable, IDrawable {

	static engine: Game;

	protected components: ComponentManager;
	private readonly gameTime: GameTime;
	public readonly config: GameConfig;
	public readonly services: TypeContainer;
	public readonly canvas: Canvas;
	protected assets: AssetBank;
	protected input: InputManager;
	protected fmod!: FMODEngine;
	protected tweener: Tweener;

	constructor(config: GameConfig) {
		///////////////////////////////////////////////////////////
		// Instantiate these first since they are singletons 
		// relied upon by components
		///////////////////////////////////////////////////////////
		Game.engine = this;
		this.services = new TypeContainer();
		this.canvas = new Canvas('#' + config.canvasID, config.width, config.height);
		///////////////////////////////////////////////////////////
	
			
		this.components = new ComponentManager();
		this.input = new InputManager();

		// Load FMOD if there is an FMODConfig in the GameConfig
		let fmodLoader: FMODLoader | undefined;
		if (config.audio && config.audio.fmodConfig) {
			fmodLoader = new FMODLoader(config.audio.fmodConfig);
			fmodLoader.onLoadFinish.subscribe((system, fmod) => {
				this.fmod = new FMODEngine(fmod, system);
				this.services.add(this.fmod);
				this.components.add(this.fmod);
			}, this);
			fmodLoader.load();
		}



		this.tweener = new Tweener();
		this.gameTime = new GameTime();	
		this.config = config;
		this.assets = new AssetBank('public/', fmodLoader);
		const anims = new AnimationManager();
		const atlasses = new AtlasManager(this.assets);
		// AssetBank also loads assets. Pass FMODLoader to wait for FMODLoader to finish, otherwise if FMODLoader is undefined, proceeds without waiting for it.
		

		// Place into services for access
		this.services
		.add(anims)
		.add(atlasses)
		.add(this.canvas)
		.add(this.input)
		.add(this.assets)
		.add(this.tweener);

		// Place components into ComponentManager
		this.components
		.add(this.input)
		.add(this.tweener);

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
		assets.load.onLoadFinish.subscribe(this.create, this);
		assets.load.load();
	}

	// ============ EVENT HANDLERS ========================
	private run = (time: number) => {
		window.requestAnimationFrame(this.run);
		let gameTime = this.gameTime;	
    gameTime.update(time);
		this.update(gameTime);
		this.draw(gameTime);	
	}

	create() {
		this.components.create();
		this.run(0);
	}

	update(gameTime: GameTime) {
		this.components.update(gameTime);	
	}

	draw(gameTime: GameTime) {
		this.components.draw(gameTime);
	}
}
