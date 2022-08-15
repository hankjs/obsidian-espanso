import * as fs from "fs";

export const readFileSync = (
  path: string,
  options:
    | BufferEncoding
    | { encoding?: BufferEncoding; flag?: string } = "utf8"
) =>
  new Promise<string>(async (resolve, reject) => {
    try {
      const data = fs.readFileSync(path, options);
      resolve(data as string);
    } catch (err: unknown) {
      if (err instanceof Error) {
        resolve(err.message);
      } else if (typeof err === "string") {
        resolve(err);
      } else {
        reject(err);
      }
    }
  });
