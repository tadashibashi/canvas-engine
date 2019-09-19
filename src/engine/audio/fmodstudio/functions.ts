// Note: These functions are also available via the FMOD object after initialization.
// Functions such as ErrorString are potentially so common that it is written here to ensure 
// functionality apart from needing access to the FMOD object instance handle.

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

 /** Check the FMOD.RESULT to see if there are any errors. Only call if source has ref to fmod
 * @function CHECK_RESULT
 * @param result The error code
 * @param str The attempted task
 * @returns void
 */
export function CHECK_RESULT (result: FMOD.RESULT, str?: string) {
    if (result != FMOD.RESULT.OK) {
    	if (str)
        alert("[FMOD ERROR!] " + ErrorString(result) + "\n" + "=> Problem while " + str);
      else
        alert("[FMOD ERROR!] " + ErrorString(result));
    }
}

function ErrorString(result: FMOD.RESULT) : string {
	const messages = [
		"No errors",
		"Tried to call a function on a data type that does not allow this type of functionality (ie calling Sound::lock on a streaming sound)",
		"Error trying to allocate a channel",
		"The specified channel has been reused to play another sound",
		"DMA Failure.  See debug output for more information",
		"DSP connection error.  Connection possibly caused a cyclic dependency or connected dsps with incompatible buffer counts",
		"DSP return code from a DSP process query callback.  Tells mixer not to call the process callback and therefore not consume CPU.  Use this to optimize the DSP graph",
		"DSP Format error.  A DSP unit may have attempted to connect to this network with the wrong format, or a matrix may have been set with the wrong size if the target unit has a specified channel map",
		"DSP is already in the mixer's DSP network. It must be removed before being reinserted or released",
		"DSP connection error.  Couldn't find the DSP unit specified",
		"DSP operation error.  Cannot perform operation on this DSP as it is reserved by the system",
		"DSP return code from a DSP process query callback.  Tells mixer silence would be produced from read, so go idle and not consume CPU.  Use this to optimize the DSP graph",
		"DSP operation cannot be performed on a DSP of this type",
		"Error loading file",
		"Couldn't perform seek operation.  This is a limitation of the medium (ie netstreams) or the file format",
		"Media was ejected while reading",
		"End of file unexpectedly reached while trying to read essential data (truncated?)",
		"End of current chunk reached while trying to read data",
		"File not found",
		"Unsupported file or audio format",
		"There is a version mismatch between the FMOD header and either the FMOD Studio library or the FMOD Low Level library",
		"A HTTP error occurred. This is a catch-all for HTTP errors not listed elsewhere",
		"The specified resource requires authentication or is forbidden",
		"Proxy authentication is required to access the specified resource",
		"A HTTP server error occurred",
		"The HTTP request timed out",
		"FMOD was not initialized correctly to support this function",
		"Cannot call this command after System::init",
		"An error occurred that wasn't supposed to.  Contact support",
		"Value passed in was a NaN, Inf or denormalized float",
		"An invalid object handle was used",
		"An invalid parameter was passed to this function",
		"An invalid seek position was passed to this function",
		"An invalid speaker was passed to this function based on the current speaker mode",
		"The syncpoint did not come from this sound handle",
		"Tried to call a function on a thread that is not supported",
		"The vectors passed in are not unit length, or perpendicular",
		"Reached maximum audible playback count for this sound's soundgroup",
		"Not enough memory or resources",
		"Can't use FMOD_OPENMEMORY_POINT on non PCM source data, or non mp3/xma/adpcm data if FMOD_CREATECOMPRESSEDSAMPLE was used",
		"Tried to call a command on a 2d sound when the command was meant for 3d sound",
		"Tried to use a feature that requires hardware support",
		"Couldn't connect to the specified host",
		"A socket error occurred.  This is a catch-all for socket-related errors not listed elsewhere",
		"The specified URL couldn't be resolved",
		"Operation on a non-blocking socket could not complete immediately",
		"Operation could not be performed because specified sound/DSP connection is not ready",
		"Error initializing output device, but more specifically, the output device is already in use and cannot be reused",
		"Error creating hardware sound buffer",
		"A call to a standard soundcard driver failed, which could possibly mean a bug in the driver or resources were missing or exhausted",
		"Soundcard does not support the specified format",
		"Error initializing output device",
		"The output device has no drivers installed.  If pre-init, FMOD_OUTPUT_NOSOUND is selected as the output mode.  If post-init, the function just fails",
		"An unspecified error has been returned from a plugin",
		"A requested output, dsp unit type or codec was not available",
		"A resource that the plugin requires cannot be found. (ie the DLS file for MIDI playback",
		"A plugin was built with an unsupported SDK version",
		"An error occurred trying to initialize the recording device",
		"Reverb properties cannot be set on this channel because a parent channelgroup owns the reverb connection",
		"Specified instance in FMOD_REVERB_PROPERTIES couldn't be set. Most likely because it is an invalid instance number or the reverb doesn't exist",
		"The error occurred because the sound referenced contains subsounds when it shouldn't have, or it doesn't contain subsounds when it should have.  The operation may also not be able to be performed on a parent sound",
		"This subsound is already being used by another sound, you cannot have more than one parent to a sound.  Null out the other parent's entry first",
		"Shared subsounds cannot be replaced or moved from their parent stream, such as when the parent stream is an FSB file",
		"The specified tag could not be found or there are no tags",
		"The sound created exceeds the allowable input channel count.  This can be increased using the 'maxinputchannels' parameter in System::setSoftwareFormat",
		"The retrieved string is too long to fit in the supplied buffer and has been truncated",
		"Something in FMOD hasn't been implemented when it should be! contact support",
		"This command failed because System::init or System::setDriver was not called",
		"A command issued was not supported by this object.  Possibly a plugin without certain callbacks specified",
		"The version number of this file format is not supported",
		"The specified bank has already been loaded",
		"The live update connection failed due to the game already being connected",
		"The live update connection failed due to the game data being out of sync with the tool",
		"The live update connection timed out",
		"The requested event, parameter, bus or vca could not be found",
		"The Studio::System object is not yet initialized",
		"The specified resource is not loaded, so it can't be unloaded",
		"An invalid string was passed to this function",
		"The specified resource is already locked",
		"The specified resource is not locked, so it can't be unlocked",
		"The specified recording driver has been disconnected",
		"The length provided exceeds the allowable limit"
	];
	return messages[result];
}