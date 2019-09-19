import { FMODPreloadFileData, FMODStudioConfig } from './types';
import { CHECK_RESULT, parseID } from './functions';
import { Loader } from '../../assets/loading/Loader';
import { DelegateGroup } from '../../utility/DelegateGroup';
import { Delegate } from '../../utility/Delegate';


export namespace FMODLoader {
	export const enum Event {
		PRELOAD,
		RUNTIMEINIT,
		BANKSLOADED,
		SOUNDTESTEND
	}
}

export class FMODLoader extends Loader {
	soundTest = false;
	
	private get system(): FMOD.StudioSystem {
		return this._system as FMOD.StudioSystem;
	}
	private _system: FMOD.StudioSystem | undefined;

	private get core(): FMOD.System {
		return this._core as FMOD.System;
	}
	private _core: FMOD.System | undefined;

	private fmod: FMOD = {};
	private config: FMODStudioConfig;

	// Events
	readonly events = new DelegateGroup<FMODLoader.Event, () => void>(
		FMODLoader.Event.PRELOAD,
		FMODLoader.Event.RUNTIMEINIT,
		FMODLoader.Event.BANKSLOADED,
		FMODLoader.Event.SOUNDTESTEND
	);

	readonly onLoadFinish = new Delegate<(system: FMOD.StudioSystem, fmodObject:FMOD) => void>();

	constructor(config: FMODStudioConfig) {
		super();
		// Handle config defaults
		this.handleFMODLoaderConfigDefaults(config);
		this.config = config;

		// Attach events
		this.events
			.on(FMODLoader.Event.PRELOAD, this, () => {
				this.evPreload(this.config.preloadFileData);
			})
			.on(FMODLoader.Event.RUNTIMEINIT, this, () => {
				this.evRuntimeInitialized();
			})
			.on(FMODLoader.Event.BANKSLOADED, this, () => {
				this.evTestSound();
			})
			.on(FMODLoader.Event.SOUNDTESTEND, this, () => {
				this.evFinish();
			});
	}

	load = () => {
		let fmod = this.fmod;
		fmod.TOTAL_MEMORY = this.config.totalMemory,
		fmod.preRun = () => {
			this.events.send(FMODLoader.Event.PRELOAD);
		},
		fmod.onRuntimeInitialized = () => {
			this.events.send(FMODLoader.Event.RUNTIMEINIT);
		}
		FMODModule(fmod);
	}

	addPreloadFiles(data: FMODPreloadFileData) {
		this.config.preloadFileData.push(data);
	}

	// ====================== EVENT HANDLERS ==========================
	/**
	 * Processes each FMODPreloadFileData config via IFMOD.FS_createPreloadedFile
	 */
	private evPreload = (configs: FMODPreloadFileData[]) => {
		console.log('FMOD is Mounting Preload files...');

		configs.forEach((data) => {
			let url = data.url? data.url : '';
			let readable = data.readable? data.readable : true;
			let writable = data.writable? data.writable : false;
			data.fileNames.forEach((filename) => {
				if (this.fmod.FS_createPreloadedFile) {
					this.fmod.FS_createPreloadedFile(data.directory, filename, this.config.assetBaseURL + '/' + url + filename, readable, writable);
				}
			});
		});		
	}

	/**
	 * Creates the FMOD Studio System object, initializes it, and loads banks, sending the signal when loaded
	 */
	private evRuntimeInitialized = () => {
		// make sure fmod object is injected
		if (!this.fmod.Studio_System_Create) {
			throw new Error('Warning! FMOD Object has not been initialized!');
			return;
		}
		console.log('FMOD Runtime has been initialized. Loading banks...');
		
		let outval: any = {};
		this.fmod.Studio_System_Create(outval);
		
		this._system = outval.val as FMOD.StudioSystem;
		CHECK_RESULT(this.system.getCoreSystem(outval), 'getting core system');
		this._core = outval.val as FMOD.System;
		CHECK_RESULT(this.system.initialize(this.config.maxChannels, this.config.studioInitFlags, this.config.initFlags, null), 'initializing FMOD Studio'); 
		// Audio workaround can work once core is available.
		this.setListenerAudioWorkaround();

		let banks: FMOD.Bank[] = [];
		
		this.config.initLoadBanks.forEach((bankData) => {
			bankData.names.forEach((bankName) => {
				let flags = bankData.flags? bankData.flags : FMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL;
				CHECK_RESULT(this.system.loadBankFile(bankName, flags, outval), 'loading bank: ' + bankName);
				banks.push(outval.val as FMOD.Bank);
			});
		});

		// Set bank loaded check. You only need to check if the last bank is loaded
		// since FMOD loads each bank in order.
		let bankCheckInterval = setInterval(() => {
			if (this.checkBanksLoaded(banks[banks.length-1])) {
				this.events.send(FMODLoader.Event.BANKSLOADED);
				clearInterval(bankCheckInterval);
			}
		}, 100);
	}

	/**
	 * Begins running the test sound (which should be silent). At this point the user may not have interacted with the screen yet.
	 * Loading will halt here until that happens. Sends the signal when this sound has finished playing.
	 */
	private evTestSound = () => {
		if (this.soundTest) {
			console.log('FMOD is testing sound');
			let outval: any = {};
			let key = this.config.soundTestEvent;
			if (key.includes('event:/')) {
				CHECK_RESULT(this.system.getEvent(key, outval), 'getting test event description via stringbank key');
			} else {
				CHECK_RESULT(this.system.getEventByID(parseID(key), outval), 'getting test event description via ID')
			}

			let desc = outval.val as FMOD.EventDescription;
			CHECK_RESULT(desc.createInstance(outval), 'creating test event instance');
			let inst = outval.val as FMOD.EventInstance;
			CHECK_RESULT(inst.start(), 'starting test event instance');

			let testSoundEndedInterval = setInterval(() => {
				if (this.checkSoundEnded(inst)) {
					this.events.send(FMODLoader.Event.SOUNDTESTEND);
					clearInterval(testSoundEndedInterval);
					inst.release(); // destroy this EventInstance from FMOD
				}
			}, 100); // check every 100 ms
		} else {
			this.events.send(FMODLoader.Event.SOUNDTESTEND);
		}
	}

	private evFinish = () => {
		console.log('FMOD has finished loading!');
		this.events.destroy();

		this.setListenerVisibilityChange();

		this.onLoadFinish.send(this._system, this.fmod);
		this.onLoadFinish.unsubscribeAll();
		this._system = undefined;
		this._core = undefined;
	}

	// ================== CHECKING (inside setInterval) ==================
	/** Function that checks if the test sound has ended */
	private checkSoundEnded = (instance: FMOD.EventInstance): boolean => {
		this.system.update();
		let outval: any = {};
		CHECK_RESULT (instance.getPlaybackState(outval), 'getting playback state');
		let state = outval.val as FMOD.STUDIO_PLAYBACK_STATE;
		return state === FMOD.STUDIO_PLAYBACK_STATE.STOPPED;
	}

	/** Function that checks if banks are loaded */
	private checkBanksLoaded = (bank: FMOD.Bank): boolean => {
		let outval: any = {};
		CHECK_RESULT (bank.getLoadingState(outval), 'getting bank loading state');
		let loadingState = outval.val as FMOD.STUDIO_LOADING_STATE;
		return ( loadingState === FMOD.STUDIO_LOADING_STATE.LOADED );
	}

	// ==================== Set Window Listeners ===========================
	/**
	 * Set event to suspend audio when window is not visible and resume when it is
	 * This event listener will last through the entirety of the users experience in the window
	 * so there is no need to remove it.
	 */
	private setListenerVisibilityChange() {
		let core = this.core;
		window.addEventListener('visibilitychange', (ev) => {
			if (document.hidden) {
				CHECK_RESULT (core.mixerSuspend(), 'suspending core mixer');
			} else {
				CHECK_RESULT (core.mixerResume(), 'resuming core mixer');
			}
		});
	}

	/**
	 * Sets Chrome/iOS workaround (gesture must happen before sound plays).
	 * Chrome/iOS will automatically suspend the audio context on page load.
	 * When a user makes an interaction for the first time on the page,
	 * this listener will suspend and resume the mixer to allow FMOD to run.
	 */
	private setListenerAudioWorkaround() {
		let core = this.core;
		let audioResumeEvent = 'click';
		let audioContextResume = () => {
			CHECK_RESULT(core.mixerSuspend(), 'suspending core mixer');
			CHECK_RESULT(core.mixerResume(), 'resuming core mixer');
			console.log('Resuming mixer.');
			window.removeEventListener(audioResumeEvent, audioContextResume);
		}
		window.addEventListener(audioResumeEvent, audioContextResume);
	}

	// ===================== UTILITY =======================================
	/**
	 * Takes the config and processes it for defaults.
	 */
	private handleFMODLoaderConfigDefaults(config: FMODStudioConfig) {
		config.initLoadBanks = config.initLoadBanks? config.initLoadBanks : [];
		config.preloadFileData = config.preloadFileData? config.preloadFileData : [];
		config.maxChannels = config.maxChannels? config.maxChannels : 128;
		config.studioInitFlags = config.studioInitFlags? config.studioInitFlags : FMOD.STUDIO_INITFLAGS.NORMAL;
		config.initFlags = config.initFlags? config.initFlags : FMOD.INITFLAGS.NORMAL;
	}
}
