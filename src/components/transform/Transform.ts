import { Component } from '../Component';
import { GameTime } from '../../core/GameTime';
import { ComponentManager } from '../ComponentManager';
import { GameObject } from '../gameobjects/GameObject';

export class Transform extends Component {
	private children: GameObject[] = [];
	readonly position: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}
	setPosition(x: number, y: number, z = 0) {
		let pos = this.position;
		pos.x = x;
		pos.y = y;
		pos.z = z;
	}

	addChild(c: GameObject) {
		if (this.children.indexOf(c) === -1) {
			this.children.push(c);
			c.onDestroy.subscribe(this, this.removeChild);
		} else {
			console.log('Warning! This Transform children array already contains this GameObject. Aborting addChild(c: GameObject)');
		}
	}

	removeChild(c: GameObject) {
		let index = this.children.indexOf(c)
		if ( index !== -1) {
			let children = this.children;
			children[index].onDestroy.unsubscribe(this, this.removeChild);
			children.splice(index, 1);
		} else {
			if (this.isDebug) {
				console.log('Warning! This GameObject does not exist in the Transform\'s child GameObject array. Aborting removeChild(c: GameObject).')
			}
		}
	}

	update(gameTime: GameTime) {
		this.children.forEach((c) => {
			let t = c.transform;
			t.setPosition(t.position.x + this.position.x, t.position.y + this.position.y, t.position.z + this.position.z);
		});
	}

	destroy() {
		this.children.forEach(c => c.onDestroy.unsubscribe(this, this.removeChild));
		this.children = [];
	}
}