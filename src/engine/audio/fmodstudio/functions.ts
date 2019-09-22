// This function replaces studio's functionality since it is not supported in JS
export function parseID(guid: string): FMOD.GUID {
	guid = guid
		.trim()
		.replace(/[^a-fA-F0-9 ]/g, ''); // Removes all chars besides a-f, A-F, 0-9

	let returnguid: FMOD.GUID = { // Init zero-value GUID
		Data1: 0, Data2: 0, Data3: 0,
		Data4: [0, 0, 0, 0, 0, 0, 0, 0]
	};

	if (guid.length === 32) {
		returnguid.Data1 = parseInt(guid.substring(0, 8), 16);
		returnguid.Data2 = parseInt(guid.substring(8, 12), 16);
		returnguid.Data3 = parseInt(guid.substring(12, 16), 16);
		for (let i = 0; i < 8; i++) {
			returnguid.Data4[i] = parseInt(guid.substring(16 + i*2, 18 + i*2), 16);
		}
	} else {
		alert('Warning! Invalid GUID stringToFMODGUID. Returning a zero-value GUID');
	}
	return returnguid;		
}

export const globals: {fmod: FMOD} = { fmod: {}};
 /** Check the FMOD.RESULT to see if there are any errors. Only call if source has ref to fmod
 * @function CHECK_RESULT
 * @param result The error code
 * @param str The attempted task
 * @returns void
 */
export function CHECK_RESULT (result: FMOD.RESULT, str?: string) {
	if (result != FMOD.RESULT.OK) {
		if (str)
			alert("[FMOD ERROR!] " + globals.fmod.ErrorString!.call(globals.fmod, result) + "\n" + "=> Problem while " + str);
		else
			alert("[FMOD ERROR!] " + globals.fmod.ErrorString!.call(globals.fmod, result));
	}
	
}