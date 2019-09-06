import { Component } from './components/Component';
import { ComponentManager } from './components/ComponentManager';
import { StateMachine } from './components/states/StateMachine';
import { GameTime } from './core/GameTime';



let joe = {};
let c = new StateMachine<'game' | 'title'>(joe);
c.add('title')
	.onEnter(() => {
		console.log('hello component');
	})
	.onUpdate((gameTime, seconds) => {
		console.log("I've been in this state for:", seconds, "seconds.");
	});

let m = new ComponentManager();

m.add(c);
m.load();

let gameTime = new GameTime();
m.get(StateMachine).start('title');
setInterval(main, 100);
let time = 0;
function main() {
	time += 100;
	gameTime.update(time);
	m.update(gameTime);
}