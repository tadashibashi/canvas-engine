import { Component } from './components/Component';
import { ComponentManager } from './components/ComponentManager';
import { StateMachine } from './components/states/StateMachine';
import { GameTime } from './core/GameTime';
import { Game } from './components/game/Game';
import { GameObject } from './components/gameobjects/GameObject';

import { Delegate } from './core/Delegate';
declare const FMODModule: (fmodObject: any) => void;

let banksLoaded = false;
let silenceEnded = false;
let eventStarted = false;


let globalPause = false;

window.onload = (ev: Event) => {
	let game = new Game({
		canvasID: 'canvas',
		width: 640,
		height: 480,
		pixelated: false,
		backgroundColor: 'black'
	});




	let gameTime = new GameTime();
	
	main(0);
 
	function main(time: number) {
		window.requestAnimationFrame(main);
		
		gameTime.update(time);
		game.update(gameTime);
		game.draw(gameTime);
	}




}



// Visibility