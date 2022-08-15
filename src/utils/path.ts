import * as _path from "path";
import { useObsidianStore } from "src/store";

export const resolve = (path: string, sourcePath?: string): string => {
  const store = useObsidianStore();
  const { vaultBasePath } = store;
  if (path == null) {
    return "";
  }

  if (path.startsWith("/")) {
    return _path.resolve(vaultBasePath, path.slice(1));
  }

  if (sourcePath != null) {
    return _path.resolve(vaultBasePath, _path.dirname(sourcePath), path);
  }

  return _path.resolve(vaultBasePath, path);
};

export const extname = (path: string) => _path.extname(path).slice(1);
