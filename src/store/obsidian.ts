import { App, getAllTags, TAbstractFile, TFile } from "obsidian";
import * as yaml from "yaml";
import * as path from "path";

import { Page, EspansoPlugin } from "src/obsidian_vue.type";
import { cachedRead } from "src/utils/vault";
import { resolve } from "src/utils/path";
import { generateConfigFile } from "src/utils/espanso";
import { useSettingStore } from ".";
import log from "src/utils/log";

export interface ObsidianState {
	app: App;
	plugin: EspansoPlugin;
	vaultBasePath: string;
	pageMap: Map<string, Page>;
}

class ObsidianStore {
	app: App = null as any;
	plugin: EspansoPlugin = null as any;
	vaultBasePath: string = null as any;
	pageMap: Map<string, Page> = new Map();

	constructor(plugin: EspansoPlugin) {
		this.init(plugin);
	}

	init(plugin: EspansoPlugin) {
		if (plugin === this.plugin) {
			return;
		}

		this.plugin = plugin;
		this.app = plugin.app;
		this.vaultBasePath = plugin.app.vault.adapter.basePath;

		plugin.registerEvent(
			this.app.metadataCache.on("resolve", (file: TFile) =>
				this.onMetadataCacheResolve(file)
			)
		);

		plugin.registerEvent(
			this.app.vault.on("delete", (file: TAbstractFile) =>
				this.onVaultDelete(file)
			)
		);

		plugin.registerEvent(
			this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) =>
				this.onVaultRename(file, oldPath)
			)
		);
	}

	onVaultDelete(file: TAbstractFile) {
		if (!this.pageMap.has(file.path)) {
			return;
		}
		this.pageMap.delete(file.path);
		generateConfigFile();
	}

	onVaultRename(file: TAbstractFile, oldPath: string) {
		if (!this.pageMap.has(file.path)) {
			return;
		}
		this.pageMap.delete(oldPath);
		this.onMetadataCacheResolve(file as TFile);
	}

	async onMetadataCacheResolve(file: TFile) {
		const { settings } = useSettingStore();
		const page = await cachedRead(file);
		const tags = getAllTags(page.metadata);
		if (!tags?.some((tag) => settings.espansoTags.includes(tag))) {
			return;
		}

		const previewBlocks = page.contents.match(/```preview(.|\s)*?```/);
		if (previewBlocks == null) {
			return;
		}

		// get espanso label
		const labelWrapReg = new RegExp(
			`${settings.labelStart}(.|\\s)*?(${settings.labelEnd})`
		);
		const labelWrapClearReg = new RegExp(
			`(${settings.labelStart})|${settings.labelEnd}`,
			"g"
		);
		const labelWrap = page.contents.match(labelWrapReg);
		const label = labelWrap
			? labelWrap[0].replace(labelWrapClearReg, "").trim()
			: path.parse(page.path).name;

		// get espanso code yaml
		const src = previewBlocks[0].replace(/(```preview)|(```)/g, "");
		const yamlConfig = yaml.parse(src);

		// init page snippet property
		page.snippetLabel = label;
		page.snippetPath = resolve(yamlConfig.path, page.path);
		page.snippetTrigger = yamlConfig.trigger;

		this.pageMap.set(page.path, page);

		generateConfigFile();
	}
}

let store: ObsidianStore = null as any;
export const useObsidianStore = (plugin?: EspansoPlugin) => {

	if (store) {
		return store;
	}

	if (!plugin) {
		log.error("Init Failed")
		return
	}

	store = new ObsidianStore(plugin);
	return store;
};
