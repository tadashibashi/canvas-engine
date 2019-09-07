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
		pixelated: false
	});

	let go = new GameObject();
	let go2 = new GameObject();
	go2.transform.addChild(go);
	game.awake();
	// let joe = {};
	// let c = new StateMachine<'game' | 'title'>(joe);
	// c.add('title')
	// 	.onEnter(() => {
	// 		console.log('hello component');
	// 	})
	// 	.onUpdate((gameTime, seconds) => {
	// 		console.log("I've been in this state for:", seconds, "seconds.");
	// 	});

	// let m = new ComponentManager();

	// m.add(c);
	// m.load();

	let gameTime = new GameTime();
	setInterval(main, 16.67);

	let time = 0;
	function main() {
		time += 16.67;
		if (time > 1000) {
			go2.transform.removeChild(go);
		}
		gameTime.update(time);
		game.update(gameTime);
		game.draw(gameTime);
	}




}

