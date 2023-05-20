import { join, relative, sep } from "node:path";
import { globby } from "globby";
import type { ResolvedConfig } from "./config.js";
import { extractParams, resolvePagePath, type Route } from "./routes.js";

export async function scanRoutes(config: ResolvedConfig): Promise<Route[]> {
  const files = await globby(
    config.pageExtensions.map((ext) => `**/*.${ext}`),
    { cwd: config.pagesDir, ignore: config.exclude }
  );

  return files.sort().flatMap((file) => {
    const path = resolvePagePath(file, config.pageExtensions);
    if (path === null) return [];

    return {
      path,
      params: extractParams(path),
      file: relative(config.cwd, join(config.pagesDir, file))
        .split(sep)
        .join("/"),
    };
  });
}
