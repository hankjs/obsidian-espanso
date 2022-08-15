export const codeBlock = "```";

export const wrapCodeBlock = (
  language: string,
  source: string
) => `${codeBlock} ${language}
${source}
${codeBlock}`;
