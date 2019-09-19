import { FMODLoaderConfig } from '../../core/loading/fmodstudio/FMODLoaderTypes';

export interface GameConfig {
	readonly canvasID: string;
	readonly width?: number;
	readonly height?: number;
	readonly pixelated: boolean;
	readonly audio?: {
		fmodConfig?: FMODLoaderConfig;
	}
}