import { InputSource } from './InputSource';

export class Keyboard extends InputSource<KeyboardEvent> {

	constructor() {
		super(-10000);
	}

  create() {
		super.create();
		window.addEventListener('keydown', (ev) => this.queueEvent(ev));
		window.addEventListener('keyup', (ev) => this.queueEvent(ev));
    this.onInput.subscribe(this.processInput, this);
	}

	processInput(ev: KeyboardEvent) {
	  let keys = this.inputs;
	  let index = this.getIndexByCode(ev.keyCode);
	  if (index !== -1) {
	  	// Will need to modify later if there are other key events added later
	  	this.inputs[index].axis = (ev.type === 'keydown')? 1 : 0;
	  }
	}

	destroy() {
		window.removeEventListener('keyup', (ev) => {this.queueEvent(ev)});
		window.removeEventListener('keydown', (ev) => {this.queueEvent(ev)});
    this.onInput.unsubscribeAll();
    super.destroy();
	}

}