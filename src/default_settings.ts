import { Settings } from "./obsidian_vue.type";

export const DEFAULT_SETTINGS: Settings = {
  appName: "Espanso Snippet",

  espansoTags: ["#snippets"],
  espansoConfigPath: undefined as any,

  labelStart: "# Overview",
  labelEnd: "(```preview)|(---)|(\\s#)",
};
