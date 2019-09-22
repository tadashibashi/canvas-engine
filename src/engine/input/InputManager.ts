import { Component } from "../Component";
import { ComponentManager } from "../ComponentManager";
import { Pointer } from "./Pointer";
import { Keyboard } from "./Keyboard";
import { GameTime } from "../GameTime";

export class InputManager extends Component {
	readonly sources = new ComponentManager();
	pointer: Pointer;
	keyboard: Keyboard;

  constructor(controllerCount = 0) {
  	super(null, -1000);
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
