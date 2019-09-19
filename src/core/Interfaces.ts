import { Delegate } from './Delegate';
import { GameTime } from './GameTime';
import { Shape } from './shapes/Shape';

export interface IDestroyable {
	destroy(): void;
	onDestroy: Delegate<(...any: any[])=>void>;
}

export interface IDebuggable {
	isDebug: boolean;
}

export interface IAwakable {
	awake(): void;
}

export interface IUpdatable {
	update(gameTime: GameTime): void;
}

export interface IEnablable {
	isEnabled: boolean;
}

export interface IDrawable {
	draw(gameTime: GameTime): void;
}

export interface ICollidable {
    collider: Shape;
}

export interface IPosition {
    position: Vector3;
}
export interface IAnchor {
    anchor: Vector3;
}