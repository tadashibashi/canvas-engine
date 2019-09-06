import { Component } from '../Component';
import { GameTime } from '../../core/GameTime';

export type PointerButtons = {
  index: number,
  isDown: boolean,
  lastDown: boolean
}

export type Key = {
  keyCode: number,
  isDown: boolean,
  lastDown: boolean
}
export enum PointerButtonCodes {
  LEFT = 0,
  RIGHT = 2
}

export enum KeyCodes {
  A = 65,
  B = 66,
  C = 67,
  D = 68,
  E = 69,
  F = 70,
  G = 71,
  H = 72,
  I = 73,
  J = 74,
  K = 75,
  L = 76,
  M = 77,
  N = 78,
  O = 79,
  P = 80,
  Q = 81,
  R = 82,
  S = 83,
  T = 84,
  U = 85,
  V = 86,
  W = 87,
  X = 88,
  Y = 89,
  Z = 90,
  SHIFT = 16,
  SPACE = 32,
  RETURN = 13,
  ALT = 18,
  KEYPAD_0 = 48,
  KEYPAD_1 = 49,
  KEYPAD_2 = 50,
  KEYPAD_3 = 51,
  KEYPAD_4 = 52,
  KEYPAD_5 = 53,
  KEYPAD_6 = 54,
  KEYPAD_7 = 55,
  KEYPAD_8 = 56,
  KEYPAD_9 = 57,
  COMMA = 188,
  PERIOD = 190,
  FSLASH = 191,
  QUOTE = 222,
  SEMICOLON = 186,
  OPEN_BRACKET = 219,
  CLOSE_BRACKET = 221,
  BSLASH = 220,
  TILDE = 192,
  ESCAPE = 27,
  CAPS_LOCK = 20,
  CONTROL = 17,
  WINKEY = 91,
  TAB = 9,
  F1 = 112,
  F2 = 113,
  F3 = 114,
  F4 = 115, 
  F5 = 116,
  F6 = 117,
  F7 = 118,
  F8 = 119,
  F9 = 120,
  F10 = 121,
  F11 = 122,
  F12 = 123,
  F13 = 124,
  F14 = 125,
  F15 = 126,
  F16 = 127,
  F17 = 128,
  F18 = 129,
  F19 = 130,
  DELETE = 46,
  EQUALS = 187,
  MINUS = 189,
  BACKSPACE = 8,
  INSERT = 45,
  HOME = 36,
  PAGE_UP = 33,
  PAGE_DOWN = 34,
  END = 35,
  UP_ARROW = 38,
  LEFT_ARROW = 37,
  RIGHT_ARROW = 39,
  DOWN_ARROW = 40,
  CLEAR = 144,
}

export class Keyboard extends Component {
	keys: Key[] = [];
	eventQueue: KeyboardEvent[] = [];

	constructor() {
		super();
		window.addEventListener('keydown', (ev) => this.eventQueue.push(ev));
		window.addEventListener('keyup', (ev) => this.eventQueue.push(ev));
	}

	update(gameTime: GameTime) {
		let keys = this.keys;
		for(let i = 0; i < keys.length; i++) { 
		  let key = keys[i];
		  key.lastDown = key.isDown;
		}
	}

	addKey(keyCode: number): Key {
	  let keys = this.keys;
	  keys.forEach((key)=> {
	    if (key.keyCode === keyCode) 
	      return key;
	  });

	  let newKey = { keyCode: keyCode, isDown: false, lastDown: false };
	  this.keys.push(newKey); 

	  return newKey; 
	}

	getAllKeys(): Key[] {
	  return this.keys;
	}

	getKey(keyCode: KeyCodes): Key {
	  let keys = this.keys;
	  let index = keys.map((key)=>key.keyCode).indexOf(keyCode);
	  if (index !== -1) {
	    return keys[index];
	  } else {
	    return null;
	  }
	}

	removeKey(keyCode: number): void {
	  let keys = this.keys;
	  let keyCodes = keys.map((key)=>key.keyCode);
	  let index = keyCodes.indexOf(keyCode);

	  if (index !== -1) {
	    this.keys.splice(index, 1);
	  }
	}

	private onKey = (ev: KeyboardEvent) => {
	  let keys = this.keys;
	  let keyCodes = keys.map((key)=>key.keyCode);
	  let index = keyCodes.indexOf(ev.keyCode);
	  if (index !== -1) {
	    this.keys[index].isDown = (ev.type === 'keydown');
	  }
	  console.log('key: ' + ev.key + ', isDown: ' + (ev.type === 'keydown'));
	}

	destroy() {
		window.removeEventListener('keydown', (ev) => {this.keyEventQueue.push(ev)});
		window.removeEventListener('keydown', (ev) => {this.keyEventQueue.push(ev)});
	}

}

export class Mouse {

}

export class InputManager extends Component {
  pButtons: PointerButtons[] = [];

  pointerEventQueue: PointerEvent[] = [];

  mousePos = { x: 0, y: 0 };
  private _mousePos = {x: 0, y: 0};
  canvas: HTMLCanvasElement;
  scale: number;
  dpr: number;
  totalScale: number;

  constructor() {
  	super(true, false, -100, 0);

    this.canvas = Game.Engine.canvas;
    this.dpr = Game.Engine.dpr;

    window.addEventListener('pointermove', this.updateMousePos);
    window.addEventListener('pointerdown', (ev) => {this.pointerEventQueue.push(ev)});
    window.addEventListener('pointerup', (ev) => {this.pointerEventQueue.push(ev)});
    // Set the scaling correctly if canvas scale is different than its resolution
    this.setScale();
    // Set an event listener to keep the scale should it change on window resize
    window.addEventListener('resize', this.setScale);
  }

  updateMousePos = (ev: MouseEvent) => {
    let rect = this.canvas.getBoundingClientRect();
    let root = this.canvas.ownerDocument.documentElement;
    let totalScale = this.totalScale;
    this.mousePos.x = (ev.clientX - rect.left - root.scrollLeft) * totalScale;
    this.mousePos.y = (ev.clientY - rect.top - root.scrollTop) * totalScale;
  }

  setScale = () => {
    let canvas = this.canvas;
    this.scale = canvas.width/canvas.clientWidth;
    this.totalScale = this.scale / this.dpr;
  }

  onPointer = (ev: MouseEvent) => {
    let mButtons = this.pButtons;
    let buttonIndexes = mButtons.map((button)=>button.index);
    let index = buttonIndexes.indexOf(ev.button);
    if (index !== -1) {
      this.pButtons[index].isDown = (ev.type === 'pointerdown');
      //console.log('button: ' + ev.button + ' isDown: ' + this.pButtons[index].isDown);
    }
  }




  addPointerButton(buttonIndex: number): PointerButtons {
    let buttons = this.pButtons;
    buttons.forEach((button) => {
      if (button.index === buttonIndex)
        return button;       
    });

    let newButton = { index: buttonIndex, isDown: false, lastDown: false };
    this.pButtons.push(newButton);
    return newButton;
  }

  removePointerButton(buttonIndex: number): void  {
    let buttons = this.pButtons;
    let indexes = buttons.map((button) => button.index);
    let index = indexes.indexOf(buttonIndex);
    if (index !== -1) { // if there is a button found with the passed index
      this.pButtons.splice(index, 1); // remove it form the array
    }
  }

  removeListeners() {

    window.removeEventListener('pointermove', this.updateMousePos);
    window.removeEventListener('pointerdown', (ev) => {this.pointerEventQueue.push(ev)});
    window.removeEventListener('pointerup', (ev) => {this.pointerEventQueue.push(ev)});
    window.removeEventListener('resize', this.setScale);
  }

  update(gameTime: GameTime) {
    
    let buttons = this.pButtons;
    for (let i = 0; i < buttons.length; i++) {
      let button = buttons[i];
      button.lastDown = button.isDown;
    } 

    if (this.pointerEventQueue.length > 0) {
      let ev = this.pointerEventQueue.shift();
      this.onPointer(ev);
    }

    if (this.keyEventQueue.length > 0) {
      let ev = this.keyEventQueue.shift();
      this.onKey(ev);
    }
  }

  keyJustDown(key: Key | Key[]): boolean {
    if (Array.isArray(key)) {
      key.forEach((k) => {
        if (k.isDown && !k.lastDown)
          return true;
      });
      return false;
    } else {
      return (key.isDown && !key.lastDown);
    }
  }

  keyJustUp(key: Key | Key[]): boolean {
    if (Array.isArray(key)) {
      key.forEach((k) => {
        if (!k.isDown && k.lastDown)
          return true;
      });
      return false;
    } else {
      return (!key.isDown && key.lastDown);
    }
    
  }

  PointerJustDown(button: PointerButtons | PointerButtons[]): boolean {
    if (Array.isArray(button)) {
      button.forEach((b) => {
        if (b.isDown && !b.lastDown)
          return true;
      });
      return false;
    } else {
      return (button.isDown && !button.lastDown);
    }
    
  }
  PointerJustUp(button: PointerButtons | PointerButtons[] ): boolean {
    if (Array.isArray(button)) {
      button.forEach((b) => {
        if (!b.isDown && b.lastDown) 
          return true;
      });
      return false;
    } else {
      return (!button.isDown && button.lastDown);
    }
    
  }
}