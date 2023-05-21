import { PathmapError } from "./errors.js";
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

export function diffPathmaps(
  previous: Record<string, unknown>,
  next: Record<string, unknown>
): { added: string[]; removed: string[] } {
  const missingFrom = (target: Record<string, unknown>) => (path: string) =>
    !Object.hasOwn(target, path);

  return {
    added: Object.keys(next).filter(missingFrom(previous)).sort(compare),
    removed: Object.keys(previous).filter(missingFrom(next)).sort(compare),
  };
}

export function serializePathmap(pathmap: Pathmap): string {
  return `${JSON.stringify(pathmap, null, 2)}\n`;
}

export function parsePathmap(
  text: string,
  file: string
): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new PathmapError(
      "INVALID_OUTPUT_FILE",
      `${file} is not valid JSON. Fix or delete it; it is left untouched until then.`,
      { cause: error }
    );
  }

  if (!isRecord(value)) {
    throw new PathmapError(
      "INVALID_OUTPUT_FILE",
      `${file} must contain a JSON object keyed by route.`
    );
  }
  return value;
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
