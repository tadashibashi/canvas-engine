import { FMODStudioConfig } from "./audio/fmodstudio/types";

export interface GameConfig {
	readonly canvasID: string;
	readonly width?: number;
	readonly height?: number;
	readonly pixelated: boolean;
	readonly audio?: {
		fmodConfig?: FMODStudioConfig;
	}
}
