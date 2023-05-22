import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { z } from "zod";
import { PathmapError } from "./errors.js";

export interface PathmapConfig<
  TEntry extends Record<string, unknown> = Record<string, unknown>
> {
  /**
   * Pages directory, relative to the project root. When omitted it is looked
   * up the way Next.js does: `pages`, then `src/pages`.
   */
  pagesDir?: string;
  /**
   * File the pathmap is written to, relative to the project root.
   * @default "pathmap/pathmap.json"
   */
  output?: string;
  /**
   * Same as `pageExtensions` in `next.config.js`.
   * @default ["tsx", "ts", "jsx", "js"]
   */
  pageExtensions?: string[];
  /**
   * Glob patterns, relative to the pages directory, of files that should not
   * appear in the pathmap.
   */
  exclude?: string[];
  /**
   * Fields every entry starts with. Values already present in the output
   * file take precedence, so entries can be edited by hand.
   */
  defaults?: TEntry;
  /**
   * Lookup tables applied per path depth: `categories[i][segment]` labels the
   * i-th segment of a route. Matched labels are collected into `categories`.
   */
  categories?: Array<Record<string, string>>;
}

export interface ResolvedConfig {
  cwd: string;
  pagesDir: string;
  output: string;
  pageExtensions: string[];
  exclude: string[];
  defaults: Record<string, unknown>;
  categories: Array<Record<string, string>> | undefined;
}

export interface LoadedConfig {
  config: unknown;
  file: string;
}

export const CONFIG_FILES = [
  "pathmap.config.js",
  "pathmap.config.mjs",
  "pathmap.config.cjs",
] as const;

const LEGACY_OPTIONS: Record<string, string> = {
  pathToPages: "pagesDir",
  pathToSave: "output",
  includes: "pageExtensions",
  excludes: "exclude",
  schema: "defaults",
};

const configSchema = z
  .object({
    pagesDir: z.string().min(1).optional(),
    output: z
      .string()
      .endsWith(".json", { message: "Expected a path to a .json file" })
      .default("pathmap/pathmap.json"),
    pageExtensions: z
      .array(
        z
          .string()
          .regex(
            /^[\w-]+(\.[\w-]+)*$/,
            'Expected an extension without a leading dot, e.g. "page.tsx"'
          )
      )
      .nonempty()
      .default(["tsx", "ts", "jsx", "js"]),
    exclude: z
      .array(
        z
          .string()
          .refine(
            (pattern) => !pattern.startsWith("!"),
            'Patterns are already exclusions; remove the leading "!"'
          )
      )
      .default([]),
    defaults: z.record(z.unknown()).default({}),
    categories: z.array(z.record(z.string())).optional(),
  })
  .strict();

export async function loadConfig(
  cwd: string,
  file?: string
): Promise<LoadedConfig | null> {
  const path =
    file === undefined
      ? CONFIG_FILES.map((name) => join(cwd, name)).find((candidate) =>
          existsSync(candidate)
        )
      : resolve(cwd, file);

  if (path === undefined) return null;

  const name = relative(cwd, path);
  if (!existsSync(path)) {
    throw new PathmapError(
      "CONFIG_LOAD_FAILED",
      `Config file ${name} does not exist.`
    );
  }

  let mod: { default?: unknown };
  try {
    mod = (await import(path)) as { default?: unknown };
  } catch (error) {
    throw new PathmapError("CONFIG_LOAD_FAILED", `Failed to load ${name}.`, {
      cause: error,
    });
  }

  if (mod.default === undefined) {
    throw new PathmapError(
      "INVALID_CONFIG",
      `${name} must have a default export.`
    );
  }
  return { config: mod.default, file: path };
}

export function resolveConfig(input: unknown, cwd: string): ResolvedConfig {
  assertNoLegacyOptions(input);

  const result = configSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "config"}: ${issue.message}`
    );
    throw new PathmapError(
      "INVALID_CONFIG",
      `Invalid configuration:\n${issues.join("\n")}`
    );
  }

  const config = result.data;
  return {
    cwd,
    pagesDir: resolvePagesDir(cwd, config.pagesDir),
    output: resolve(cwd, config.output),
    pageExtensions: config.pageExtensions,
    exclude: config.exclude,
    defaults: config.defaults,
    categories: config.categories,
  };
}

function resolvePagesDir(cwd: string, pagesDir: string | undefined): string {
  if (pagesDir !== undefined) {
    const dir = resolve(cwd, pagesDir);
    if (!isDirectory(dir)) {
      throw new PathmapError(
        "ROUTER_DIR_NOT_FOUND",
        `The pages directory ${pagesDir} does not exist.`
      );
    }
    return dir;
  }

  const detected = [join(cwd, "pages"), join(cwd, "src", "pages")].find(
    isDirectory
  );
  if (detected === undefined) {
    throw new PathmapError(
      "ROUTER_DIR_NOT_FOUND",
      `Could not find a "pages" directory in ${cwd}. Set "pagesDir" in the config.`
    );
  }
  return detected;
}

function assertNoLegacyOptions(input: unknown): void {
  if (typeof input !== "object" || input === null) return;

  const renamed = Object.keys(input)
    .filter((key) => Object.hasOwn(LEGACY_OPTIONS, key))
    .map((key) => `  - ${key} -> ${LEGACY_OPTIONS[key] ?? ""}`);

  if (renamed.length > 0) {
    throw new PathmapError(
      "INVALID_CONFIG",
      [
        "These options were renamed in next-pathmap 2.0:",
        ...renamed,
        "See https://github.com/wonkooklee/next-pathmap#migrating-from-1x",
      ].join("\n")
    );
  }
}

function isDirectory(path: string): boolean {
  return statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false;
}
