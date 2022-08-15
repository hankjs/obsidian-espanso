import { CachedMetadata, FileStats, Plugin } from "obsidian";

export interface Settings {
  appName: string;

  espansoTags: string[];
  espansoConfigPath: string;

  labelStart: string;
  labelEnd: string;
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
