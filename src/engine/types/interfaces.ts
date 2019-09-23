import { Delegate } from "../utility/Delegate";
import { GameTime } from "../GameTime";

export interface IDestroyable {
	destroy(): void;
	onDestroy: Delegate<(...any: any[])=>void>;
}

export interface IDebuggable {
	isDebug: boolean;
}

export interface IAwakable {
	create(): void;
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

export interface IPosition {
    position: Vector3Like;
}
export interface IAnchor {
    anchor: Vector3Like;
}