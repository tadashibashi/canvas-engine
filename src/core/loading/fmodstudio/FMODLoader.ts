import { StateMachine } from '../../../components/states/StateMachine';
import { IFMOD, FMOD, CHECK_RESULT } from '../../../libraries/IFMOD/IFMOD';
import { Loader } from '../Loader';
import { Delegate } from '../../Delegate';
declare const FMODModule: (fmodObject: any)=>void;

interface FMODStudioConfig {
	preloadFiles: string[];
	baseDir: string;
	totalMemory: number;
	studioInitFlags: IFMOD.STUDIO_INITFLAGS;
	initFlags: IFMOD.INITFLAGS;
	initBanksLoad: string[];
}

interface FMODPreloadFileData {
	/**
	 * Where in the virtual directory you want this file to go. 
	 * Use '/' for root directory.
	 */
	directory: string;
	/**
	 * filename with extension. e.g. 'Master Bank.bank'
	 */
	fileNames: string[];
	/**
	 * URL relative to the assetBaseURL set on FMODLoader's construction.
	 * Do not fill in, or put an empty string if in the assetBaseURL root.
	 * e.g. 'banks/' // if the folder structure of the assetBaseURL includes a 'banks' folder.
	 */
	url?: string;

	/**
	 * Will the file be readable? (default) true
	 */
	readable?: boolean;

	/**
	 * Will the file be writable? (default) false
	 */
	writable?: boolean
}

export class FMODLoader extends Loader {
	system: IFMOD.StudioSystem;
	core: IFMOD.System;

	assetBaseURL: string;
	readonly totalMemory: number;
	private preloadData: FMODPreloadFileData[] = [];

	onFMODPreload = new Delegate<() => void>();
	onFMODRuntimeInit = new Delegate<() => void>();
	onBanksLoaded = new Delegate<() => void>();
	onTestSoundEnded = new Delegate<() => void>();
	onLoadFinish = new Delegate<(system: IFMOD.StudioSystem) => void>();

	constructor(memory: number, assetBaseURL: string) {
		super();
		this.totalMemory = memory;
		this.assetBaseURL = assetBaseURL;

		// attach events
		this.onFMODPreload.subscribe(this, () => {this.preloadEvent(this.preloadData)});
		this.onFMODRuntimeInit.subscribe(this, () => {this.runtimeInitializedEvent();});
		this.onBanksLoaded.subscribe(this, () => {this.testSoundEvent();});
		this.onTestSoundEnded.subscribe(this, () => {this.finishEvent();});
	}

	load() {
		FMOD.TOTAL_MEMORY = this.totalMemory;
		FMOD.preRun = () => {this.onFMODPreload.send();};
		FMOD.onRuntimeInitialized = () => {this.onFMODRuntimeInit.send();};
		FMODModule(FMOD);
	}

	addPreloadFiles(data: FMODPreloadFileData) {
		this.preloadData.push(data);
	}


	private preloadEvent = (configs: FMODPreloadFileData[]) => {
		console.log('FMOD is Mounting Preload files...');
		configs.forEach((data) => {
			let url = data.url? data.url : '';
			let readable = data.readable? data.readable : true;
			let writable = data.writable? data.writable : false;
			data.fileNames.forEach((filename) => {
				IFMOD.FS_createPreloadedFile(data.directory, filename, this.assetBaseURL + '/' + url + filename, readable, writable);
			});
		});		
	}

	private runtimeInitializedEvent = () => {
		// TODO: Have data passed configurgurably with config object
		console.log('FMOD Runtime has been initialized. Loading banks...');
		let outval: any = {};
		IFMOD.Studio_System_Create(outval);
		this.system = outval.val as IFMOD.StudioSystem;
		CHECK_RESULT(this.system.getCoreSystem(outval), 'getting core system');
		this.core = outval.val as IFMOD.System;
		CHECK_RESULT(this.system.initialize(128, IFMOD.STUDIO_INITFLAGS.NORMAL, IFMOD.INITFLAGS.NORMAL, null), 'initializing FMOD Studio');
		
		// Load banks
		this.system.loadBankFile('Master Bank.bank', IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL, outval);
		this.system.loadBankFile('Master Bank.strings.bank', IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL, outval);

		// Set bank loaded check. TODO: Make this event just accept Bank[]
		let bankCheckInterval = setInterval(() => {
			if (this.checkBanksLoaded(this.system)) {
				this.onBanksLoaded.send();
				clearInterval(bankCheckInterval);
			}
		}, 100);
	}

	private testSoundEvent = () => {
		console.log('FMOD is testing sound');
		// TODO: Configurable testeventname via GUID or EventName (flag for isGUID in config)
		let outval: any = {};
		CHECK_RESULT(this.system.getEvent('event:/Silence', outval), 'getting test event description');
		let desc = outval.val as IFMOD.EventDescription;
		CHECK_RESULT(desc.createInstance(outval), 'creating test event instance');
		let inst = outval.val as IFMOD.EventInstance;
		CHECK_RESULT(inst.start(), 'starting test event instance');

		let testSoundEndedInterval = setInterval(() => {
			if (this.checkSoundEnded(inst)) {
				this.onTestSoundEnded.send();
				clearInterval(testSoundEndedInterval);
				inst.release();
			}
		}, 100);
	}

	private checkSoundEnded = (instance: IFMOD.EventInstance): boolean => {
		this.system.update();
		let outval: any = {};
		CHECK_RESULT(instance.getPlaybackState(outval), 'getting playback state');
		let state = outval.val as IFMOD.STUDIO_PLAYBACK_STATE;
		return state === IFMOD.STUDIO_PLAYBACK_STATE.STOPPED;
	}

	private checkBanksLoaded = (system: IFMOD.StudioSystem): boolean => {
		let outval: any = {};
		system.getBankList(outval, 10, null);
		let banks: IFMOD.Bank[] = outval.val;
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

	private finishEvent = () => {
		console.log('FMOD has finished loading!');
		this.onFMODPreload.unsubscribeAll();
		this.onFMODRuntimeInit.unsubscribeAll();
		this.onBanksLoaded.unsubscribeAll();
		this.onTestSoundEnded.unsubscribeAll();
		
		window.addEventListener('visibilitychange', (ev) => {
			if (document.hidden) {
				CHECK_RESULT(this.core.mixerSuspend(), 'suspending core mixer');
			} else {
				CHECK_RESULT(this.core.mixerResume(), 'resuming core mixer');
			}
		});

		let audioResumeEvent = 'pointerdown';
		let audioContextResume = (ev) => {
			CHECK_RESULT(this.core.mixerResume(), 'resuming core mixer');
			console.log('Resuming mixer.');
			window.removeEventListener(audioResumeEvent, audioContextResume);
		}
		window.addEventListener(audioResumeEvent, audioContextResume);
		
		this.onLoadFinish.send(this.system);
	}
}