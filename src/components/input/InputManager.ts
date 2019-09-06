import { Component } from '../Component';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { Pointer } from './sources/Pointer';
import { InputSource } from './sources/InputSource';
import { Keyboard } from './sources/Keyboard';

export class InputManager extends Component {
	readonly sources = new ComponentManager();
	pointer: Pointer;
	keyboard: Keyboard;

  constructor(controllerCount = 0) {
  	super(-1000);
  	this.pointer = new Pointer();
  	this.keyboard = new Keyboard();
  	this.sources
  		.add(this.pointer)
  		.add(this.keyboard);
  }

  awake() {
  	this.sources.awake();
  }

  update(gameTime: GameTime) {
  	this.sources.update(gameTime);
  }
}