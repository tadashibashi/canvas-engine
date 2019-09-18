import { Component } from '../Component';
import { CHECK_RESULT, Outval, parseID } from './FMODRuntimeUtil';
import { GameTime } from '../../core/GameTime';
import { FMODLoaderConfig } from '../../core/loading/fmodstudio/FMODLoaderTypes';
import { FMODLoader } from '../../core/loading/fmodstudio/FMODLoader';
import { EventInstance } from './EventInstance';

/**
 * A string or FMOD.GUID. String can be the string path if the strings.bank is
 * loaded, or a GUID in string form. 
 */
type FMODKey = string | FMOD.GUID;

export class FMODEngine extends Component {
	private _fmod: FMOD | undefined;
	private _system: FMOD.StudioSystem | undefined;
	private _core: FMOD.System | undefined;
	get fmod() {
		return this._fmod as FMOD;
	}
	get system() {
		return this._system as FMOD.StudioSystem;
	}
	get core() {
		return this._core as FMOD.System;
	}

	constructor(fmod: FMOD, studioSystem: FMOD.StudioSystem){
		super(null, 100);
		this._fmod = fmod;
		this._system = studioSystem;
		let outval: any = {};
		studioSystem.getCoreSystem(outval);
		this._core = outval.val as FMOD.System;
	}

	getEvent(event: FMODKey): FMOD.EventDescription {
		let outval = new Outval();
		if (typeof event === 'string') {
			if (event.includes('event:/') || event.includes('snapshot:/')) {
				CHECK_RESULT( this.system.getEvent(event, outval), 'getting event description' );
			} else {
				CHECK_RESULT( this.system.getEventByID(parseID(event), outval), 'getting event description by parsed GUID' );
			}	
		} else if (typeof event === 'object') {
			CHECK_RESULT( this.system.getEventByID(event, outval), 'getting event description by GUID' );
		}
		return outval.val as FMOD.EventDescription;
	}

	createInstance(event: FMODKey, callbackFlags = FMOD.STUDIO_EVENT_CALLBACK_TYPE.ALL): EventInstance {
		let ev = this.getEvent(event);
		let outval: any = {};
		CHECK_RESULT(ev.createInstance(outval), 'creating event instance');
		let inst = new EventInstance(outval.val as FMOD.EventInstance, callbackFlags);
		return inst;
	}

	/**
	 * Releases the event, the parent fsb and subsound on destroyprogrammersound event.
	 * Although set to destroy itself, sound will be returned if needed to stop it earlier.
	 */
	createProgrammerOneShot(event: FMODKey, fsbPath: string, subsoundIndex: number): EventInstance {
		let inst = this.createInstance(event);
		let snd: FMOD.Sound;
		
		inst.setCallbackFlags(FMOD.STUDIO_EVENT_CALLBACK_TYPE.CREATE_PROGRAMMER_SOUND | FMOD.STUDIO_EVENT_CALLBACK_TYPE.DESTROY_PROGRAMMER_SOUND);
		inst.on.createprogrammersound.subscribe(this, (ev, props) => {
			let outval: any = {};
			if (this.fmod.CREATESOUNDEXINFO) {
				CHECK_RESULT( this.core.createSound(fsbPath, FMOD.MODE.LOOP_NORMAL, this.fmod.CREATESOUNDEXINFO(), outval), 'creating fsb FMOD.Sound');
			} 
			snd = outval.val as FMOD.Sound;
			CHECK_RESULT( snd.getSubSound(subsoundIndex, outval), 'getting subsound from fsb');
			props.sound = outval.val as FMOD.Sound;
		});
		inst.on.destroyprogrammersound.subscribe(this, (ev, props) => {
			CHECK_RESULT( props.sound.release(), 'releasing child sound' );
			CHECK_RESULT( snd.release(), 'releasing parent fsb sound');
			inst.destroy();
		});
		return inst;
	}

	/**
	 * Create a programmer-equipped sound. Releases the passed sound in 'props' on the destroyprogrammersound event.
	 * Default callback flags are Create and Destroy Programmer Sound events, which are required at minimum.
	 */
	createProgrammerInstance (
		event: FMODKey, 
		onCreateProgrammerSound: (props: FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES) => void, 
		flags: FMOD.STUDIO_EVENT_CALLBACK_TYPE = FMOD.STUDIO_EVENT_CALLBACK_TYPE.CREATE_PROGRAMMER_SOUND | FMOD.STUDIO_EVENT_CALLBACK_TYPE.DESTROY_PROGRAMMER_SOUND
	): EventInstance {
		let inst = this.createInstance(event, flags);
		inst.on.createprogrammersound.subscribe(this, (ev, props) => {
			onCreateProgrammerSound(props);
		});
		inst.on.destroyprogrammersound.subscribe(this, (ev, props) => {
			//props.sound.release();
		});
		return inst;
	}

	/**
	 * Helper that retrieves an event, then immediately plays and releases it: fire-and-forget.
	 * 
	 */
	playOneShot(event: FMODKey): void {
		let ev = this.getEvent(event);
		let outval: any = {};
		CHECK_RESULT( ev.isOneshot(outval), 'getting isOneshot from event description' );
		let oneshot = outval.val as boolean;
		if (oneshot) {
			ev.createInstance(outval);
			let inst = outval.val as FMOD.EventInstance;
			CHECK_RESULT( inst.start(), 'starting oneshot event instance');
			CHECK_RESULT( inst.release(), 'releasing oneshot event instance' );
		} else {
			alert('Event is not a oneshot!');
		}
	}

	update(gameTime: GameTime): void {
		CHECK_RESULT(this.system.update(), 'updating system');
	}

	destroy() {
		this._system = undefined;
		this._core = undefined;
		this._fmod = undefined;
		super.destroy();
	}


}