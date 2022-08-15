import { writeFileSync } from "fs";
import diff from "microdiff";
import * as yaml from "yaml";
import { Notice } from "obsidian";

import { Page } from "src/obsidian_vue.type";
import { readFileSync } from "./file";
import { useObsidianStore, useSettingStore } from "src/store";
import log from "./log";
import { debounce, sortBy } from "src/utils/lodash";

export interface TriggerVar {
  name: string;
  type: string;
  params: {
    cmd: string;
    shell: string;
    trim: boolean;
  };
}

export interface Matches {
  trigger: string;
  replace: string;
  label: string;
  ctime: number;
  vars: TriggerVar[];
}

export function getPowershellMatches(data: Required<Page>): Matches {
  return {
    trigger: data.snippetTrigger,
    replace: "{{snippet}}",
    label: data.snippetLabel,
    ctime: data.stat.ctime,
    vars: [
      {
        name: "snippet",
        type: "shell",
        params: {
          cmd: `cat ${data.snippetPath}`,
          shell: "powershell",
          trim: false,
        },
      },
    ],
  };
}

export const generateConfigFile = debounce(async () => {
  const { espansoConfigFilePath } = useSettingStore();
  if (!espansoConfigFilePath) {
    new Notice(`Please set Espanso file directory`);
    return;
  }

  // Local old config
  const oldConfig = yaml.parse(await readConfigFile());

  // New config
  const store = useObsidianStore();
  const { pageMap } = store;
  const pageList = [...pageMap.values()] as Required<Page>[];
  const matches = pageList.map(getPowershellMatches);

  // Diff
  const changes = diff(
    matches2Obj(oldConfig.matches || []),
    matches2Obj(matches)
  );

  log.table(changes);

  if (changes == null) {
    return;
  }

  const config = yaml.stringify({
    matches,
  });

  writeFileSync(
    espansoConfigFilePath,
    `# generate by Obsidian Espanso Snippet Plugin

${config}`
  );
}, 1000);

export function matches2Obj(list: Matches[]): Record<string, Matches> {
  const res: Record<string, Matches> = {};

  list.forEach(
    (matches) => (res[`${matches.label}:${matches.ctime}`] = matches)
  );

  return res;
}

export async function readConfigFile() {
  const { espansoConfigFilePath } = useSettingStore();
  return readFileSync(espansoConfigFilePath);
}
