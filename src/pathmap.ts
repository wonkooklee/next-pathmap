import type { Route } from "./routes.js";

export type PathmapEntry<TEntry extends object = Record<string, unknown>> =
  TEntry & {
    /** Names of the dynamic segments of the route. */
    query: string[];
    /** Labels picked from `categories`. Present only when it is configured. */
    categories?: string[];
  };

export type Pathmap<TEntry extends object = Record<string, unknown>> = Record<
  string,
  PathmapEntry<TEntry>
>;

export interface BuildPathmapOptions {
  defaults: Record<string, unknown>;
  categories: Array<Record<string, string>> | undefined;
  previous: Record<string, unknown>;
}

/**
 * Builds a pathmap whose entries layer, from lowest to highest precedence,
 * `defaults`, the entry already in the previous pathmap, and the fields
 * derived from the route itself.
 */
export function buildPathmap(
  routes: readonly Route[],
  { defaults, categories, previous }: BuildPathmapOptions
): Pathmap {
  const pathmap: Pathmap = {};

  for (const route of [...routes].sort((a, b) => compare(a.path, b.path))) {
    pathmap[route.path] = {
      ...defaults,
      ...toRecord(previous[route.path]),
      ...(categories && {
        categories: resolveCategories(route.path, categories),
      }),
      query: route.params,
    };
  }

  return pathmap;
}

export function serializePathmap(pathmap: Pathmap): string {
  return `${JSON.stringify(pathmap, null, 2)}\n`;
}

function resolveCategories(
  path: string,
  categories: Array<Record<string, string>>
): string[] {
  return path
    .split("/")
    .slice(1)
    .flatMap((segment, depth) => {
      const labels = categories[depth];
      return labels && Object.hasOwn(labels, segment)
        ? [labels[segment] as string]
        : [];
    });
}

function toRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
