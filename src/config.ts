import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { PathmapError } from "./errors.js";
import type { RouterKind } from "./routes.js";

export interface PathmapConfig<
  TEntry extends Record<string, unknown> = Record<string, unknown>
> {
  /**
   * Pages Router directory, relative to the project root. When omitted it is
   * looked up the way Next.js does: `pages`, then `src/pages`. `false` skips
   * the Pages Router entirely.
   */
  pagesDir?: string | false;
  /**
   * App Router directory, relative to the project root. When omitted it is
   * looked up the way Next.js does: `app`, then `src/app`. `false` skips the
   * App Router entirely.
   */
  appDir?: string | false;
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
   * Glob patterns, relative to each router directory, of files that should
   * not appear in the pathmap.
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

export interface RouterSource {
  kind: RouterKind;
  dir: string;
}

export interface ResolvedConfig {
  cwd: string;
  routers: RouterSource[];
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

const routerDir = z.union([z.string().min(1), z.literal(false)]).optional();

const configSchema = z
  .object({
    pagesDir: routerDir,
    appDir: routerDir,
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
    mod = (await import(pathToFileURL(path).href)) as { default?: unknown };
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
    routers: resolveRouters(cwd, config.pagesDir, config.appDir),
    output: resolve(cwd, config.output),
    pageExtensions: config.pageExtensions,
    exclude: config.exclude,
    defaults: config.defaults,
    categories: config.categories,
  };
}

/**
 * Mirrors Next.js: `app` and `pages` at the project root win, and `src` is
 * only considered when neither of them exists there.
 */
export function detectRouterDirs(
  cwd: string
): Partial<Record<RouterKind, string>> {
  for (const base of [cwd, join(cwd, "src")]) {
    const found: Partial<Record<RouterKind, string>> = {};
    for (const kind of ["app", "pages"] as const) {
      const dir = join(base, kind);
      if (isDirectory(dir)) found[kind] = dir;
    }
    if (Object.keys(found).length > 0) return found;
  }
  return {};
}

function resolveRouters(
  cwd: string,
  pagesDir: string | false | undefined,
  appDir: string | false | undefined
): RouterSource[] {
  const detected =
    pagesDir === undefined || appDir === undefined ? detectRouterDirs(cwd) : {};

  const routers: RouterSource[] = [];
  for (const [kind, option] of [
    ["app", appDir],
    ["pages", pagesDir],
  ] as const) {
    if (option === false) continue;

    const dir = option === undefined ? detected[kind] : resolve(cwd, option);
    if (dir === undefined) continue;
    if (!isDirectory(dir)) {
      throw new PathmapError(
        "ROUTER_DIR_NOT_FOUND",
        `The ${kind} directory ${option ?? dir} does not exist.`
      );
    }
    routers.push({ kind, dir });
  }

  if (routers.length === 0) {
    throw new PathmapError(
      "ROUTER_DIR_NOT_FOUND",
      `Could not find an "app" or "pages" directory in ${cwd}. Set "appDir" or "pagesDir" in the config.`
    );
  }
  return routers;
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
