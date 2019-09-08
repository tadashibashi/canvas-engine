import { Component } from './components/Component';
import { ComponentManager } from './components/ComponentManager';
import { StateMachine } from './components/states/StateMachine';
import { GameTime } from './core/GameTime';
import { Game } from './components/game/Game';
import { GameObject } from './components/gameobjects/GameObject';

import { IFMOD, FMOD, CHECK_RESULT } from './libraries/IFMOD/IFMOD';
import { Delegate } from './core/Delegate';
declare const FMODModule: (fmodObject: any) => void;

let system: IFMOD.StudioSystem;
let core: IFMOD.System;
let banksLoaded = false;
let silenceEnded = false;
let eventStarted = false;
let event: IFMOD.EventInstance;
let silence: IFMOD.EventInstance;

let globalPause = false;

window.onload = (ev: Event) => {
	let game = new Game({
		canvasID: 'canvas',
		width: 640,
		height: 480,
		pixelated: false,
		backgroundColor: 'black'
	});

	FMOD.preRun = () => {
		IFMOD.FS_createPreloadedFile('/', 'Master Bank.bank', './public/audio/banks/Master Bank.bank', true, false);
		IFMOD.FS_createPreloadedFile('/', 'Master Bank.strings.bank', './public/audio/banks/Master Bank.strings.bank', true, false);	
	}
	let outval: any = {};
	FMOD.onRuntimeInitialized = () => {
		console.log('runtime initialized, loading banks');
		IFMOD.Studio_System_Create(outval);
		system = outval.val as IFMOD.StudioSystem;
		system.getCoreSystem(outval);
		core = outval.val as IFMOD.System;
		system.initialize(128, IFMOD.STUDIO_INITFLAGS.NORMAL, IFMOD.INITFLAGS.NORMAL, null);
		CHECK_RESULT (system.loadBankFile('Master Bank.bank', IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL, outval), 'loading master bank');
		CHECK_RESULT(system.loadBankFile('Master Bank.strings.bank', IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL, outval), 'loading master bank strings');
		CHECK_RESULT (system.getEvent('event:/Music', outval), 'getting music event');
		let desc = outval.val as IFMOD.EventDescription;
		desc.createInstance(outval);
		event = outval.val as IFMOD.EventInstance;
		//event.start();
	}

	FMOD.TOTAL_MEMORY = 64*1024*1024;
	FMODModule(FMOD);
	window.addEventListener('visibilitychange', function(ev) {
		if (banksLoaded && silenceEnded && eventStarted && core) {
			if (document.hidden) {
				globalPause = true;
				core.mixerSuspend();
			}
			else {
				globalPause = false;
				core.mixerResume();
			}
		}

	});

	game.awake();

	let gameTime = new GameTime();
	
	main(0);
 
	function main(time: number) {
		window.requestAnimationFrame(main);
		if (globalPause) return;
		console.log('hello', time);
		if (system) {
			// Checking if banks are loaded
			if (!banksLoaded) {
				let outval: any = {};
				system.getBankList(outval, 10, null);
				let banks: IFMOD.Bank[] = outval.val;
				let arebanksloaded = true;
				banks.forEach((b) => {
					let outval: any = {};
					b.getLoadingState(outval)
					let loadstate: IFMOD.STUDIO_LOADING_STATE = outval.val;
					if (loadstate !== IFMOD.STUDIO_LOADING_STATE.LOADED) arebanksloaded = false;
				});
				banksLoaded = arebanksloaded;
				if (banksLoaded) {
					CHECK_RESULT(system.getEvent('event:/Silence', outval), 'getting silence');
					let desc: IFMOD.EventDescription = outval.val;
					desc.createInstance(outval);
					silence = outval.val;
					silence.start();
					console.log('silence starting...');
				}
			} // End check if banks are loaded
			// CHECK Silence
			if (banksLoaded && !silenceEnded) {
				silence.getPlaybackState(outval);
				let playbackState: IFMOD.STUDIO_PLAYBACK_STATE = outval.val;
				if (playbackState === IFMOD.STUDIO_PLAYBACK_STATE.STOPPED) {
					console.log('silence ended');
					silenceEnded = true;
				}
			}// End Check Silence
			// Check Event Start
			if (banksLoaded && silenceEnded && !eventStarted) {
				eventStarted = true;
				console.log('auido ready, starting event!');
				event.start();
			}

			system.update();
		}
		
		gameTime.update(time);
		game.update(gameTime);
		game.draw(gameTime);
	}




}



// Visibility