import { Game1 } from "./Game1";
import { FMODStudioConfig } from "../engine/audio/fmodstudio/types";

export function init() {
  let fmodConfig: FMODStudioConfig = {

		studioInitFlags: 	FMOD.STUDIO_INITFLAGS.LIVEUPDATE,
		initFlags: 			FMOD.INITFLAGS.PROFILE_ENABLE,

		assetBaseURL: 		'public/audio/',

		totalMemory: 		32 * 1024 * 1024,
		maxChannels: 		128,
				
		preloadFileData:
		[
			{
				directory: '/',
				fileNames: ['Master Bank.bank', 'Master Bank.strings.bank', 'bank.fsb'],
				url: 'banks/'
			}
		],
		initLoadBanks: 
		[
			{ 
				names: ['Master Bank.bank', 'Master Bank.strings.bank'],
				flags: FMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL
			}
		],
		soundTestEvent: '{d8502bb9-8601-4625-a90a-3498d165b1d0}'
	};

	new Game1({
		canvasID: 'gui',
		width: 320,
		height: 180,
		pixelated: true,
		audio: {
			fmodConfig: fmodConfig,
		}
	}).start();
}