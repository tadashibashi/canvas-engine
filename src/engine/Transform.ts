import { Component } from "./Component";
import { ComponentManager } from "./ComponentManager";
import { Vector3 } from "./math/Vector3";
import { Delegate } from "./utility/Delegate";
import { GameTime } from "./GameTime";

export class Transform extends Component {
    readonly children = new ComponentManager<Transform>();

	/**
	 * Returns a new Vector3 marking this transform's relative position
	 */
    get position(): Vector3 {
		let pos = this._position;
		return new Vector3(pos.x, pos.y, pos.z);
	}
	private _positionLast = new Vector3();
    private _position = new Vector3();

	/**
	 * Returns a new Vector3 marking this transform's final position
	 */
    get positionFinal(): Vector3 {
		let pos = this._finalPosition;
        return new Vector3(pos.x, pos.y, pos.z);
    }
	private _finalPosition = new Vector3();
    private _finalPositionLast = new Vector3();
	
    parent: Transform | undefined;

	/**
	 * A delegate/event when position has changed
	 */
    readonly onPositionChanged = new Delegate<(position: Vector3Like) => void>();

	setPosition(x: number, y: number, z?: number) {
		let pos = this._position;
		let posLast = this._positionLast;
		posLast.x = pos.x;
		posLast.y = pos.y;
		posLast.z = pos.z;
		pos.x = x;
        pos.y = y;
        if (z) {
            pos.z = z;
        }
		this.setFinalPosition();
	}

	getPosition(relative = false) {
		if (relative) {
			return this._position;
		} else {
			return this._finalPosition;
		}
	}
	getLastPosition(relative = false) {
		if (relative) {
			return this._positionLast;
		} else {
			return this._finalPositionLast;
		}
	}

	setParent(transform: Transform) {
		this.parent = transform;
	}

	removeParent() {
		this.parent = undefined;
	}

	private setFinalPosition() {
		let myPos = this._position;
		let x = myPos.x;
		let y = myPos.y;
		let z = myPos.z;

		let parent = this.parent;
		if (parent) {
			let parentPos = parent.getPosition();		

			x += parentPos.x;
			y += parentPos.y;
			z += parentPos.z;
		}

        let finalPos = this._finalPosition;
        this._finalPositionLast.x = finalPos.x;
        this._finalPositionLast.y = finalPos.y;
        this._finalPositionLast.z = finalPos.z;

		finalPos.x = x;
		finalPos.y = y;
        finalPos.z = z;

        if (!this.areVector3Same(this._finalPosition, this._finalPositionLast)) {
            this.onChangePosition.send(this._finalPosition);
        }
    }

    private areVector3Same(pos1: Vector3Like, pos2: Vector3Like) {
        return (pos1.x === pos2.x && pos1.y === pos2.y && pos1.z === pos2.z);
    }

	constructor(x = 0, y = 0, z = 0) {
		super(null, 0); // <- updateOrder
		this.setPosition(x, y, z);
		this.children.onAdded.subscribe(this, (transform) => {
			transform.setParent(this);
		});
		this.children.onRemoved.subscribe(this, (transform) => {
			transform.removeParent();
		});
	}

    update(gameTime: GameTime) {
		this.children.forEach((c) => {
			c.setFinalPosition();
        });
	}

	// Don't destroy children, just remove them from the children ComponentManager references
	destroy() {
		let children = this.children;
		children.forEach((c) => {
			children.remove(c)
		});
		this.parent = undefined;
		super.destroy();
	}
}