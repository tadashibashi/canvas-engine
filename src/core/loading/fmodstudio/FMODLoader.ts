import { IFMOD, FMOD, CHECK_RESULT, parseGUID } from '../../../libraries/IFMOD/IFMOD';
import { Loader } from '../Loader';
import { Delegate } from '../../Delegate';
import { DelegateGroup } from '../../DelegateGroup';
import { FMODPreloadFileData, FMODLoaderConfig } from './FMODLoaderTypes';

// In index.html make sure that fmodstudio.js is loaded in a script before this library's modules
declare const FMODModule: (fmodObject: any)=>void;

export class FMODLoader extends Loader {
	private system: IFMOD.StudioSystem;
	private core: IFMOD.System;

	// Events
	readonly events = new DelegateGroup<
	'preload' | 'runtimeinit' | 'banksloaded' | 'testsoundended', () => void>();
	readonly onLoadFinish = new Delegate<(system: IFMOD.StudioSystem) => void>();

	constructor(private config: FMODLoaderConfig) {
		super();
		// Handle config defaults
		this.handleFMODLoaderConfigDefaults(config);

		// Attach events
		this.events
			.on('preload', this, () => {this.evPreload(this.config.preloadFileData);})
			.on('runtimeinit', this, () => {this.evRuntimeInitialized();})
			.on('banksloaded', this, () => {this.evTestSound();})
			.on('testsoundended', this, () => {this.evFinish();});
	}

	load() {
		FMOD.TOTAL_MEMORY = this.config.totalMemory;
		FMOD.preRun = () => {this.events.send('preload');};
		FMOD.onRuntimeInitialized = () => {this.events.send('runtimeinit');};
		FMODModule(FMOD);
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
				IFMOD.FS_createPreloadedFile(data.directory, filename, this.config.assetBaseURL + '/' + url + filename, readable, writable);
			});
		});		
	}

	/**
	 * Creates the FMOD Studio System object, initializes it, and loads banks, sending the signal when loaded
	 */
	private evRuntimeInitialized = () => {
		// TODO: Have data passed configurgurably with config object
		console.log('FMOD Runtime has been initialized. Loading banks...');
		let outval: any = {};
		IFMOD.Studio_System_Create(outval);
		this.system = outval.val as IFMOD.StudioSystem;
		CHECK_RESULT(this.system.getCoreSystem(outval), 'getting core system');
		this.core = outval.val as IFMOD.System;
		CHECK_RESULT(this.system.initialize(this.config.maxChannels, this.config.studioInitFlags, this.config.initFlags, null), 'initializing FMOD Studio'); 
		// Audio workaround can work once core is available.
		this.setListenerAudioWorkaround();

		let banks: IFMOD.Bank[] = [];
		// Load banks. TODO: Make a function that receives the config file and spits out Bank[]
		this.config.initLoadBanks.forEach((bankData) => {
			bankData.names.forEach((bankName) => {
				let flags = bankData.flags? bankData.flags : IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL;
				CHECK_RESULT(this.system.loadBankFile(bankName, flags, outval), 'loading bank: ' + bankName);
				banks.push(outval.val);
			});
		});

		// Set bank loaded check
		let bankCheckInterval = setInterval(() => {
			if (this.checkBanksLoaded(banks)) {
				this.events.send('banksloaded');
				clearInterval(bankCheckInterval);
			}
		}, 100);
	}

	/**
	 * Begins running the test sound (which should be silent). At this point the user may not have interacted with the screen yet.
	 * Loading will halt here until that happens. Sends the signal when this sound has finished playing.
	 */
	private evTestSound = () => {
		console.log('FMOD is testing sound');
		let outval: any = {};
		let key = this.config.soundTestEvent;
		if (key.includes('event:/')) {
			CHECK_RESULT(this.system.getEvent(key, outval), 'getting test event description via stringbank key');
		} else {
			CHECK_RESULT(this.system.getEventByID(parseGUID(key), outval), 'getting test event description via ID')
		}

		let desc = outval.val as IFMOD.EventDescription;
		CHECK_RESULT(desc.createInstance(outval), 'creating test event instance');
		let inst = outval.val as IFMOD.EventInstance;
		CHECK_RESULT(inst.start(), 'starting test event instance');

		let testSoundEndedInterval = setInterval(() => {
			if (this.checkSoundEnded(inst)) {
				this.events.send('testsoundended');
				clearInterval(testSoundEndedInterval);
				inst.release(); // destroy this EventInstance from FMOD
			}
		}, 100); // check every 100 ms
	}

	private evFinish = () => {
		console.log('FMOD has finished loading!');
		this.events.destroy();

		this.setListenerVisibilityChange();

		this.onLoadFinish.send(this.system);
		this.onLoadFinish.unsubscribeAll();
	}

	// ================== CHECKING (inside setInterval) ==================
	private checkSoundEnded = (instance: IFMOD.EventInstance): boolean => {
		this.system.update();
		let outval: any = {};
		CHECK_RESULT(instance.getPlaybackState(outval), 'getting playback state');
		let state = outval.val as IFMOD.STUDIO_PLAYBACK_STATE;
		return state === IFMOD.STUDIO_PLAYBACK_STATE.STOPPED;
	}

	private checkBanksLoaded = (banks: IFMOD.Bank[]): boolean => {
		let outval: any = {};
		let areBanksLoaded = true;
		banks.forEach((bank) => {
			bank.getLoadingState(outval);
			let loadingState: IFMOD.STUDIO_LOADING_STATE = outval.val;
			if (loadingState !== IFMOD.STUDIO_LOADING_STATE.LOADED) {
				areBanksLoaded = false;
			}
		});
		return areBanksLoaded;
	}

	// ==================== Set Window Listeners ===========================
	private setListenerVisibilityChange() {
		// Event to suspend audio when window is not visible and resume when it is
		window.addEventListener('visibilitychange', (ev) => {
			if (document.hidden) {
				CHECK_RESULT(this.core.mixerSuspend(), 'suspending core mixer');
			} else {
				CHECK_RESULT(this.core.mixerResume(), 'resuming core mixer');
			}
		});
	}

	private setListenerAudioWorkaround() {
		// Set chrome/ios workaround (gesture must happen before sound plays)
		let audioResumeEvent = 'click';
		let audioContextResume = (ev) => {
			CHECK_RESULT(this.core.mixerSuspend(), 'suspending core mixer');
			CHECK_RESULT(this.core.mixerResume(), 'resuming core mixer');
			console.log('Resuming mixer.', ev);
			window.removeEventListener(audioResumeEvent, audioContextResume);
		}
		window.addEventListener(audioResumeEvent, audioContextResume);
	}

	// ===================== UTILITY =======================================
	private handleFMODLoaderConfigDefaults(config: FMODLoaderConfig) {
		config.initLoadBanks = config.initLoadBanks? config.initLoadBanks : [];
		config.preloadFileData = config.preloadFileData? config.preloadFileData : [];
		config.maxChannels = config.maxChannels? config.maxChannels : 128;
		config.studioInitFlags = config.studioInitFlags? config.studioInitFlags : IFMOD.STUDIO_INITFLAGS.NORMAL;
		config.initFlags = config.initFlags? config.initFlags : IFMOD.INITFLAGS.NORMAL;
	}
}