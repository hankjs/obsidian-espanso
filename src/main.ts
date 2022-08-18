import {
  Component,
  MarkdownPostProcessorContext,
  MarkdownRenderer,
  parseYaml,
} from "obsidian";
import { wrapCodeBlock } from "./utils/string";
import { extname, resolve } from "./utils/path";
import { readFileSync, selectFileSync } from "./utils/file";
import { SettingPlugin } from "./setting.class";

export default class  extends SettingPlugin {
  async onload() {
    super.onload();

    this.registerPriorityCodeblockPostProcessor(
      "preview",
      -100,
      async (source: string, el, ctx) =>
        this.preview(source, el, ctx, ctx.sourcePath)
    );
  }

  onunload() {
    super.onunload();
  }

  /** Register a markdown codeblock post processor with the given priority. */
  public registerPriorityCodeblockPostProcessor(
    language: string,
    priority: number,
    processor: (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => Promise<void>
  ) {
    let registered = this.registerMarkdownCodeBlockProcessor(
      language,
      processor
    );
    registered.sortOrder = priority;
  }

  public async preview(
    source: string,
    el: HTMLElement,
    component: Component | MarkdownPostProcessorContext,
    sourcePath: string
  ) {
    const codeSetting = parseYaml(source);
    const path = codeSetting?.path;
    const language =
      codeSetting?.language || codeSetting?.lang || extname(path);
    const filePath = resolve(path, sourcePath);
    const code = await selectFileSync(filePath, codeSetting.start, codeSetting.end);

    MarkdownRenderer.renderMarkdown(
      wrapCodeBlock(language, code),
      el,
      sourcePath,
      component as Component
    );
  }
}
