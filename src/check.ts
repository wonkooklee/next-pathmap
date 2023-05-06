import { existsSync } from "node:fs";

export function checkFileExist(filename: string) {
  return existsSync(filename);
}
