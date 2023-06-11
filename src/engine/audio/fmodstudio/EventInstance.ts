import { CHECK_RESULT } from "./functions";
import { IDestroyable } from "../../types/interfaces";
import { Delegate } from "../../utility/Delegate";


export class EventInstance implements IDestroyable {
	
	protected instance!: FMOD.EventInstance;

	private _callbackFlags = FMOD.STUDIO_EVENT_CALLBACK_TYPE.ALL;
	onDestroy = new Delegate<(instance: EventInstance) => void>();
	readonly on = {
		/**
		 * Called when an instance is fully created
		 */
		created: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * Called when an instance is just about to be destroyed
		 */
		destroyed: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * EventInstance.start has been called on an event which was not
		 * already playing. The event will remain in this state until
		 * its sample data has been loaded.
		 */
		starting: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * The event has commenced playing. Normally this callback will
		 * be issued immediately after 'starting', but may be delayed
		 * until sample data is loaded.
		 */
		started: new Delegate<(event: EventInstance)=>void>(),	
		/**
		 * Called when an instance is restarted
		 */	
		restarted: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * The event has stopped
		 */
		stopped: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * Start has been called but the polyphony settings did not allow
		 * the event to start. In this case none of the start events will be called.
		 */
		startfailed: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * A programmer sound is about to play. FMOD expects the callback to provide
		 * an FMOD.Sound object for it to use.
		 */
		createprogrammersound: new Delegate<(event: EventInstance, props: FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES)=>void>(),
		/**
		 * A programmer sound has stopped playing. At this point it is safe to release
		 * the FMOD.Sound that was used.
		 */
		destroyprogrammersound: new Delegate<(event: EventInstance, props: FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES)=>void>(),
		/**
		 * Called when the timeline passes a named marker
		 */
		timelinemarker: new Delegate<(event: EventInstance, props: FMOD.STUDIO_TIMELINE_MARKER_PROPERTIES) => void>(),
		/**
		 * Called when the timeline hits a beat in a tempo section
		 */
		timelinebeat: new Delegate<(event: EventInstance, props: FMOD.STUDIO_TIMELINE_BEAT_PROPERTIES) => void>(),
		/**
		 * Called when the even plays a sound
		 */
		soundplayed: new Delegate<(event: EventInstance, sound: FMOD.Sound) => void>(),
		/**
		 * Called when the event finishes playing a sound
		 */
		soundstopped: new Delegate<(event: EventInstance, sound: FMOD.Sound) => void>(),
		/**
		 * Called when the event becomes virtual
		 */
		realtovirtual: new Delegate<(event: EventInstance)=>void>(),
		/**
		 * Called when the event becomes real
		 */
		virtualtoreal: new Delegate<(event: EventInstance)=>void>(),
		all: new Delegate<(event: EventInstance, 
			params?: FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES | FMOD.STUDIO_TIMELINE_BEAT_PROPERTIES | 
			FMOD.STUDIO_TIMELINE_MARKER_PROPERTIES | FMOD.Sound)=>void>(),
	}

	constructor(eventInstance: FMOD.EventInstance, callbackFlags = FMOD.STUDIO_EVENT_CALLBACK_TYPE.ALL) {
		this.instance = eventInstance;
		this.setCallbackFlags(callbackFlags);
		Object.seal(this.on);
	}


	setCallbackFlags(flags: FMOD.STUDIO_EVENT_CALLBACK_TYPE) {
		this.instance.setCallback(this.callbackHandler, flags);
		this._callbackFlags = flags;
	}
	getCallbackFlags(): FMOD.STUDIO_EVENT_CALLBACK_TYPE {
			return this._callbackFlags;
	}

	private callbackHandler = (type: FMOD.STUDIO_EVENT_CALLBACK_TYPE, event: FMOD.EventInstance, parameters: any) => {
		switch(type) {
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.CREATED:
				this.on.created.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.DESTROYED:
				this.on.destroyed.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.STARTING:
				this.on.starting.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.STARTED:
				this.on.started.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.RESTARTED:
				this.on.restarted.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.STOPPED:
				this.on.stopped.send(this);
			break;		
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.START_FAILED:
				this.on.startfailed.send(this);
			break;			
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.CREATE_PROGRAMMER_SOUND:
				this.on.createprogrammersound.send(this, parameters as FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES);
			break;			
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.DESTROY_PROGRAMMER_SOUND:
				this.on.destroyprogrammersound.send(this, parameters as FMOD.STUDIO_PROGRAMMER_SOUND_PROPERTIES);
			break;
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.TIMELINE_BEAT:
				this.on.timelinebeat.send(this, parameters as FMOD.STUDIO_TIMELINE_BEAT_PROPERTIES);
			break;
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.TIMELINE_MARKER:
				if (parameters.name)
					this.on.timelinemarker.send(this, parameters as FMOD.STUDIO_TIMELINE_MARKER_PROPERTIES);
			break;
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.SOUND_PLAYED:
				this.on.soundplayed.send(this, parameters as FMOD.Sound);
			break;			
			case FMOD.STUDIO_EVENT_CALLBACK_TYPE.SOUND_STOPPED:
				this.on.soundstopped.send(this, parameters as FMOD.Sound);
			break;
		}
		this.on.all.send(this, parameters);

		return FMOD.RESULT.OK;
	}

	getRaw(): FMOD.EventInstance {
		return this.instance;
	}

	/**
	 * Set a send level of this event instance on a low-level reverb instance
	 * @param index Index of the low-level reverb instance (0-3).
	 * @param sendLevel Send level of the signal to the reverb from 0 (off) to 1 (full).
	 */
	setReverbLevel(index: number, sendLevel: number): EventInstance  {
		CHECK_RESULT( this.instance.setReverbLevel(index, sendLevel), 'setting low-level reverb level on event instance');
		return this;
	}
	/**
	 * Gets the send level of this event instance on a low-level reverb instance.
	 * Will return a number 0 (no send) to 1 (full send).
	 * @param index Index of the low-level reverb instance (0-3).
	 */
	getReverbLevel(index: number): number {
		let outval: any = {};
		CHECK_RESULT(this.instance.getReverbLevel(index, outval), 'getting low-level reverb level from event instance');
		return outval.val as number;
	}

	/**
	 * Gets the volume level of this event intance
	 * @param finalOut Whether or not to get the final calculated value or not.
	 * If false it will return the programmer API-set value.
	 */
	getVolume(finalOut = false): number {
		let volval: any = {};
		let finalval: any = {};
		CHECK_RESULT (this.instance.getVolume(volval, finalval), 'getting volume of event instance');
		return finalOut ? finalval.val : volval.val;
	}

	/**
	 * Triggers cue on the event to allow the timeline curosor to move past sustain points.
	 */
	triggerCue(): void {
		CHECK_RESULT( this.instance.triggerCue(), 'triggering event instance cue' );
	}

	/**
	 * Sets the volume of this event instance
	 * @param value 0 (silent) to 1 (full volume)
	 */
	setVolume(value: number): EventInstance {
		CHECK_RESULT( this.instance.setVolume(value), 'setting event instance volume');
		return this;
	}

	/**
	 * Returns the playback state
	 
	 */
	getPlaybackState(): FMOD.STUDIO_PLAYBACK_STATE {
		let outval: any = {};
		this.instance.getPlaybackState(outval);
		return outval.val as FMOD.STUDIO_PLAYBACK_STATE;
	}

	/**
	 * @param name Name of the parameter
	 * @param finalValue True: returns the final calculated value 
	 * False: returns the programmer API-set value. 
	 * Default: false
	 */
	getParameter(name: string, finalValue?: boolean): number;
	/**
	 * @param id The Studio Parameter ID
	 * @param finalValue True: returns the final calculated value 
	 * False: returns the programmer API-set value. 
	 * Default: false
	 */
	getParameter(id: FMOD.STUDIO_PARAMETER_ID, finalValue?: boolean): number;
	/**
	 * Get a parameter's value
	 */
	getParameter(id: string | FMOD.STUDIO_PARAMETER_ID, finalValue = false): number {
		const outval: any = {};
		const finalval: any = {};
		if (typeof id === 'string') {
			CHECK_RESULT(this.instance.getParameterByName(id, outval, finalval), 'getting event instance parameter by name');
		} else {
			CHECK_RESULT(this.instance.getParameterByID(id, outval, finalval), 'getting event instance parameter by id');
		}
		return finalValue? finalval.val : outval.val as number;
	}

	setParameter(name: string, value: number, ignoreSeekspeed?: boolean): EventInstance;
	setParameter(id: FMOD.STUDIO_PARAMETER_ID, value: number, ignoreSeekspeed?: boolean): EventInstance;
	setParameter(ids: FMOD.STUDIO_PARAMETER_ID[], values: number[], ignoreSeekspeed?: boolean): EventInstance;
	setParameter(id: string | FMOD.STUDIO_PARAMETER_ID | FMOD.STUDIO_PARAMETER_ID[], value: number | number[], ignoreSeekspeed = false): EventInstance {
		if (typeof id === 'string') {
			this.instance.setParameterByName(id, value as number, ignoreSeekspeed);
		} else if (!Array.isArray(id)) {
			this.instance.setParameterByID(id, value as number, ignoreSeekspeed);
		} else {
			let values = value as number[];
			this.instance.setParametersByIDs(id, values, values.length, ignoreSeekspeed);
			
		}
		return this;
	}

	setTimelinePosition(position: number): EventInstance {
		CHECK_RESULT(this.instance.setTimelinePosition(position), 'setting event instance timeline position');
		return this;
	}

  getTimelinePosition(): number {
		let outval: any = {};
		CHECK_RESULT(this.instance.getTimelinePosition(outval), 'getting event instance timeline position');
		return outval.val as number;
	}

	getPaused(): boolean {
		let outval: any = {};
		CHECK_RESULT( this.instance.getPaused(outval), 'getting event instance paused' );
		return outval.val as boolean;
	}
	setPaused(pause: boolean): EventInstance {
		CHECK_RESULT( this.instance.setPaused(pause), 'setting event instance paused');
		return this;
	}

	/**
	 * Retrives the pitch multiplier set by the API on the event instance
	 * @param finalPitch Whether or not to receive the final combined pitch value,
	 * taking modulation and parameter chasing into account. Otherwise it will return
	 * the direct value set by the API.
	 */
	getPitch(finalPitch = false): number {
		let pitchOut: any = {};
		let finalPitchOut: any = {};
		CHECK_RESULT( this.instance.getPitch(pitchOut, finalPitchOut), 'getting event instance pitch' );
		if (finalPitch) {
			return finalPitchOut.val as number;
		} else {
			return pitchOut.val as number;
		}
	}

	/**
	 * Set the pitch multiplier for the event instance
	 */
	setPitch(multiplier: number): EventInstance {
		CHECK_RESULT( this.instance.setPitch(multiplier), 'setting event instance pitch');
		return this;
	}

	/**
	 * Starts replay of the event instance
	 */
	start(): EventInstance {
		CHECK_RESULT( this.instance.start(), 'starting event instance');
		return this;
	}

	/**
	 * Stops the event instance
	 * @param allowFadeOut True: Fades out sound if there is an envelope modulator attached
	 * False: Stops sound immediately
	 * Default: false
	 */
	stop(allowFadeOut = true): EventInstance {
		let mode = allowFadeOut? FMOD.STUDIO_STOP_MODE.ALLOWFADEOUT : FMOD.STUDIO_STOP_MODE.IMMEDIATE;
		CHECK_RESULT( this.instance.stop(mode), 
			'stopping event instance');
		return this;
	}

	/**
	 * Stops and releases the event instance
	 */
	destroy(stop = false): void {
		CHECK_RESULT( this.instance.release(), 'releasing event instance');
		if (stop) {
			this.stop();
		}
	}
}