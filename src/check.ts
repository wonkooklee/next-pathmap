import { existsSync } from "node:fs";

export function checkConfigExist() {
  return existsSync("pathmap.config.js");
}
