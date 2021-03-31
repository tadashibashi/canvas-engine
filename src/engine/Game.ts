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
import { AnimationManager } from "./graphics/AnimationManager";
import { AtlasManager } from "./graphics/AtlasManager";
import { AssetLoadManager } from "./assets/loading/AssetLoadManager";
import { SceneManager } from "./scenes/SceneManager";

export class Game implements IUpdatable, IDrawable {
	loaded = false;
	static engine: Game;
	protected components: ComponentManager;
	private readonly gameTime: GameTime;
	public readonly config: GameConfig;
	public readonly services: TypeContainer;
	public readonly canvas: Canvas;
	protected assets: AssetBank;
	protected fmod!: FMODEngine;
	protected scenes: SceneManager;
	protected load: AssetLoadManager;
	protected input: InputManager;

	constructor(config: GameConfig) {
		///////////////////////////////////////////////////////////
		// Instantiate these first since they are singletons 
		// relied upon by components
		///////////////////////////////////////////////////////////
		Game.engine = this;
		this.services = new TypeContainer();
		this.canvas = new Canvas('#' + config.canvasID, config.width, config.height);
		///////////////////////////////////////////////////////////
	

		this.components = new ComponentManager()
		.add(this.scenes = new SceneManager())
		.add(this.input = new InputManager(config.gameControllers? config.gameControllers : 0));
		

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

		this.gameTime = new GameTime();	
		this.config = config;
		this.assets = new AssetBank();
		this.load = new AssetLoadManager('public/', this.assets, fmodLoader);
		// AssetBank also loads assets. Pass FMODLoader to wait for FMODLoader to finish, otherwise if FMODLoader is undefined, proceeds without waiting for it.
		
		// Place into services for access
		this.services
		.add(new AnimationManager())
		.add(new AtlasManager(this.assets))
		.add(this.canvas)
		.add(this.assets)
		.add(this.scenes)
		.add(this.input);

		// Place components into ComponentManager
		// SceneManager

	}


	// ============ INITIALIZATION ========================	
	start() {
		this.load.onLoadFinish.subscribe(() => {this.create(), this.loaded = true});
		this.preload();
		this.load.load();
	}

	/**
	 * Overwrite for your own preloading of assets. Optional per scene
	 */
	preload() {
		
		
	}

	/**
	 * Overwrite for game end to do any necessary unloading. NOT IMPLEMENTED!
	 */
	unload() {

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
