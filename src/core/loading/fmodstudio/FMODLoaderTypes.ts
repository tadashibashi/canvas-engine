import { IFMOD } from '../../../libraries/IFMOD/IFMOD';

export interface FMODLoaderConfig {
	/**
	 * The default base path that the Loader will look for 
	 * local assets to mount onto FMOD during preloading.
	 */
	assetBaseURL: string;
	/**
	 * A list of bank configs indicating which banks to load during FMOD initialization.
	 * Each config can load multiple banks under the specified bank loading flags.
	 */
	initLoadBanks?: {
		/**
		 * Names, including file extension and virtual directory path if 
		 * any set in the corresponding FMODPreloadFileData config. 
		 * e.g. 'Master Bank.bank' or 'banks/Master Bank.strings.bank'
		 */
		names: string[];
		/**
		 * Defaults to IFMOD.STUDIO_LOAD_BANK_FLAGS.NORMAL
		 */
		flags?: IFMOD.STUDIO_LOAD_BANK_FLAGS;
	}[];
	/**
	 * Pass either an FMOD Event Name (only if you load the .strings.bank file), 
	 * TODO: or a GUID string (with or without braces)
	 */
	soundTestEvent: string;
	/**
	 * Optional preloadFileData. You can also set this via 
	 * FMODLoader.addPreloadFiles() before loading.
	 */
	preloadFileData?: FMODPreloadFileData[];
	/**
	 * Maximum numbers of channels to play simultaneously.
	 * (default) 128
	 */
	maxChannels?: number;
	/**
	 * The total memory to allocate for FMOD Studio. 
	 * (default) 64*1024*1024, which is 16mb
	 */
	totalMemory?: number;
	/**
	 * Studio System Initialization Flags. 
	 * (default) IFMOD.STUDIO_INITFLAGS.NORMAL
	 */
	studioInitFlags?: IFMOD.STUDIO_INITFLAGS;
	/**
	 * Core System Initialization Flags. 
	 * (default) IFMOD.INITFLAGS.NORMAL
	 */
	initFlags?: IFMOD.INITFLAGS;
}

export interface FMODPreloadFileData {
	/**
	 * Where in the virtual directory you want this file to go. 
	 * Use '/' for root directory.
	 */
	directory: string;
	/**
	 * filename with extension. e.g. 'Master Bank.bank'
	 */
	fileNames: string[];
	/**
	 * URL relative to the assetBaseURL set on FMODLoader's construction.
	 * Leave null, or put an empty string if in the assetBaseURL root.
	 * e.g. 'banks/' // if the folder structure of the assetBaseURL includes a 'banks' folder.
	 */
	url?: string;

	/**
	 * Will the file be readable? (default) true
	 */
	readable?: boolean;

	/**
	 * Will the file be writable? (default) false
	 */
	writable?: boolean
}