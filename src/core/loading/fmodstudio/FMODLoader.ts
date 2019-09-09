import { StateMachine } from '../../../components/states/StateMachine';
import { IFMOD, FMOD } from '../../../libraries/IFMOD/IFMOD';
import { Loader } from '../Loader';
declare const FMODModule: (fmodObject: any)=>void;

interface FMODStudioConfig {
	preloadFiles: string[];
	baseDir: string;
	totalMemory: number;
	studioInitFlags: IFMOD.STUDIO_INITFLAGS;
	initFlags: IFMOD.INITFLAGS;
	initBanksLoad: string[];
}

export class FMODLoader extends Loader {
	states: StateMachine<'initializing' | 'bank-loading' | 'silence-testing' | 'ready'>;
	system: IFMOD.StudioSystem;
	core: IFMOD.System;
	
	constructor(memory: number, testSoundKey: string | IFMOD.GUID) {
		super();
		FMOD.TOTAL_MEMORY = memory;
		FMOD.preRun = this.createPreloadedFiles;
		
		
		this.states = new StateMachine(this);
		this.states.add('initializing')
			.on('enter', () => {
				FMODModule(FMOD);
			});

		this.states.add('ready')
			.on('enter', () => {
				window.addEventListener('visibilitychange', function(ev) {
					if (document.hidden) {

					}
				});
			});
	}

	queue() {

	}
	load() {this.states.start('initializing');}

	createPreloadedFiles() {
		// for each item in queue IFMOD.FS_createPreloadedFile
	}




}