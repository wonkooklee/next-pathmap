import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { loadConfig, resolveConfig, type PathmapConfig } from "./config.js";
import { PathmapError } from "./errors.js";
import {
  buildPathmap,
  diffPathmaps,
  serializePathmap,
  type Pathmap,
} from "./pathmap.js";
import type { Route } from "./routes.js";
import { scanRoutes } from "./scan.js";

export interface GenerateOptions {
  /**
   * Project root that every configured path is resolved against.
   * @default process.cwd()
   */
  cwd?: string;
  /** Inline configuration. When given, no config file is loaded. */
  config?: PathmapConfig;
  /** Config file to load instead of looking up `pathmap.config.{js,mjs,cjs}`. */
  configFile?: string;
  /**
   * Set to `false` to compute the result without touching the output file.
   * @default true
   */
  write?: boolean;
}

export interface GenerateResult {
  pathmap: Pathmap;
  routes: Route[];
  /** Absolute path of the output file. */
  output: string;
  /** Absolute path of the loaded config file, if any. */
  configFile: string | null;
  added: string[];
  removed: string[];
  /** Whether the output file differs, or would differ, from the one on disk. */
  changed: boolean;
}

export async function generate(
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  const root = resolve(options.cwd ?? process.cwd());
  const loaded = options.config
    ? null
    : await loadConfig(root, options.configFile);
  const config = resolveConfig(options.config ?? loaded?.config ?? {}, root);

  const routes = await scanRoutes(config);
  if (routes.length === 0) {
    throw new PathmapError(
      "NO_ROUTES_FOUND",
      `No routes were found in ${relative(root, config.pagesDir)}.`
    );
  }

  const previousText = await readTextIfExists(config.output);
  const previous = previousText === null ? {} : parsePrevious(previousText);

  const pathmap = buildPathmap(routes, {
    defaults: config.defaults,
    categories: config.categories,
    previous,
  });
  const text = serializePathmap(pathmap);
  const changed = text !== previousText;

  if (changed && options.write !== false) {
    await mkdir(dirname(config.output), { recursive: true });
    await writeFile(config.output, text);
  }

  return {
    pathmap,
    routes,
    output: config.output,
    configFile: loaded?.file ?? null,
    ...diffPathmaps(previous, pathmap),
    changed,
  };
}

function parsePrevious(text: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

async function readTextIfExists(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
