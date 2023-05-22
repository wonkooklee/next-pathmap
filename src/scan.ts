import { join, relative, sep } from "node:path";
import { globby } from "globby";
import type { ResolvedConfig } from "./config.js";
import { PathmapError } from "./errors.js";
import { extractParams, resolvePagePath, type Route } from "./routes.js";

export async function scanRoutes(config: ResolvedConfig): Promise<Route[]> {
  const files = await globby(
    config.pageExtensions.map((ext) => `**/*.${ext}`),
    { cwd: config.pagesDir, ignore: config.exclude }
  );

  const routes = new Map<string, Route>();
  for (const file of files.sort()) {
    const path = resolvePagePath(file, config.pageExtensions);
    if (path === null) continue;

    const route: Route = {
      path,
      params: extractParams(path),
      file: relative(config.cwd, join(config.pagesDir, file))
        .split(sep)
        .join("/"),
    };

    const conflict = routes.get(path);
    if (conflict) {
      throw new PathmapError(
        "DUPLICATE_ROUTE",
        `${conflict.file} and ${route.file} both resolve to ${path}.`
      );
    }
    routes.set(path, route);
  }

  return [...routes.values()];
}
