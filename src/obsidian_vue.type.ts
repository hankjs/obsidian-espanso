import { CachedMetadata, FileStats, Plugin } from "obsidian";

export interface Settings {
	espansoTags: string[];
	espansoConfigPath: string;

	labelStart: string;
	labelEnd: string;
}

export interface YamlConfig {
	/** preview file path and generate [[LINK to link file]] */
	link?: string;
	/** preview file path */
	path?: string;
	start?: number | string
	end?: number | string
	trigger?: string
}

export interface Page {
	path: string;
	contents: string;
	metadata: CachedMetadata;
	stat: FileStats;
	snippetPath?: string;
	snippetTrigger?: string;
	snippetLabel?: string;
}

export interface ISetting {
	settings: Settings;

	loadSettings: () => any;
	saveSettings: () => any;
}

export type EspansoPlugin = Plugin & ISetting;
