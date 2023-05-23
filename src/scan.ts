import { join, relative, sep } from "node:path";
import { globby } from "globby";
import type { ResolvedConfig } from "./config.js";
import { PathmapError } from "./errors.js";
import {
  extractParams,
  resolveRoutePath,
  type Route,
  type RouterKind,
} from "./routes.js";

export async function scanRoutes(config: ResolvedConfig): Promise<Route[]> {
  const routes = new Map<string, Route>();

  for (const { kind, dir } of config.routers) {
    const files = await globby(patternsFor(kind, config.pageExtensions), {
      cwd: dir,
      ignore: config.exclude,
    });

    for (const file of files.sort()) {
      const path = resolveRoutePath(file, kind, config.pageExtensions);
      if (path === null) continue;

      const route: Route = {
        path,
        params: extractParams(path),
        file: relative(config.cwd, join(dir, file)).split(sep).join("/"),
        router: kind,
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
  }

  return [...routes.values()];
}

function patternsFor(kind: RouterKind, pageExtensions: string[]): string[] {
  const name = kind === "app" ? "page" : "*";
  return pageExtensions.map((ext) => `**/${name}.${ext}`);
}
