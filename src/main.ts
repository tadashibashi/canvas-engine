import { Component } from './components/Component';
import { ComponentManager } from './components/ComponentManager';
import { StateMachine } from './components/states/StateMachine';
import { GameTime } from './core/GameTime';
import { Game } from './components/game/Game';
import { GameObject } from './components/gameobjects/GameObject';

window.onload = (ev: Event) => {
	let game = new Game({
		canvasID: 'canvas',
		height: 180,
		width: 320,
		pixelated: false,
		backgroundColor: 'black'
	});


	game.awake();

	let gameTime = new GameTime();
	setInterval(main, 16.67);

	let time = 0;
	function main() {
		time += 16.67;
		gameTime.update(time);
		game.update(gameTime);
		game.draw(gameTime);
	}




}

