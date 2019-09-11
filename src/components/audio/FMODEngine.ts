import { Component } from '../Component';
import { IFMOD, CHECK_RESULT, parseGUID } from '../../libraries/IFMOD/IFMOD';
import { GameTime } from '../../core/GameTime';

type FMODKey = string | IFMOD.GUID;

export class FMODEngine extends Component {
	private system: IFMOD.StudioSystem;
	constructor(studioSystem: IFMOD.StudioSystem) {
		super(100);
		this.system = studioSystem;
	}

	getEvent(event: FMODKey): IFMOD.EventDescription {
		let outval: any = {};
		if (typeof event === 'string') {
			if (event.includes('event:/') || event.includes('snapshot:/')) {
				CHECK_RESULT( this.system.getEvent(event, outval), 'getting event description' );
			} else {
				CHECK_RESULT( this.system.getEventByID(parseGUID(event), outval), 'getting event description by parsed GUID' );
			}	
		} else if (typeof event === 'object') {
			CHECK_RESULT( this.system.getEventByID(event, outval), 'getting event description by GUID' );
		}
		return outval.val as IFMOD.EventDescription;
	}

	createInstance(event: FMODKey): IFMOD.EventInstance {
		let ev = this.getEvent(event);
		let outval: any = {};
		CHECK_RESULT(ev.createInstance(outval), 'creating event instance');
		let inst = outval.val as IFMOD.EventInstance;
		return inst;
	}

	playOneShot(event: FMODKey): void {
		let ev = this.getEvent(event);
		let outval: any = {};
		CHECK_RESULT( ev.isOneshot(outval), 'getting isOneshot from event description' );
		let oneshot = outval.val as boolean;
		if (oneshot) {
			ev.createInstance(outval);
			let inst = outval.val as IFMOD.EventInstance;
			CHECK_RESULT( inst.start(), 'starting oneshot event instance');
			CHECK_RESULT( inst.release(), 'releasing oneshot event instance' );
		} else {
			alert('Event is not a oneshot!');
		}
	}

	update(gameTime: GameTime): void {
		this.system.update();
	}


}