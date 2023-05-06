import { existsSync } from "node:fs";
export function checkFileExist(filename) {
    return existsSync(filename);
}
