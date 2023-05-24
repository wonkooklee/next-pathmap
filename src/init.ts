import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { CONFIG_FILES, detectRouterDirs } from "./config.js";
import { PathmapError } from "./errors.js";

export async function init(cwd: string): Promise<string> {
  const existing = CONFIG_FILES.find((name) => existsSync(join(cwd, name)));
  if (existing !== undefined) {
    throw new PathmapError("CONFIG_EXISTS", `${existing} already exists.`);
  }

  const { app, pages } = detectRouterDirs(cwd);
  if (app === undefined && pages === undefined) {
    throw new PathmapError(
      "ROUTER_DIR_NOT_FOUND",
      `Could not find an "app" or "pages" directory in ${cwd}.`
    );
  }

  const toOption = (dir: string) =>
    JSON.stringify(relative(cwd, dir).split(sep).join("/"));

  const lines = [
    `/** @type {import("next-pathmap").PathmapConfig} */`,
    `export default {`,
    ...(app ? [`  appDir: ${toOption(app)},`] : []),
    ...(pages ? [`  pagesDir: ${toOption(pages)},`] : []),
    `  output: "pathmap/pathmap.json",`,
    `  defaults: {},`,
    `};`,
    ``,
  ];

  const file = join(cwd, "pathmap.config.mjs");
  await writeFile(file, lines.join("\n"));
  return file;
}
