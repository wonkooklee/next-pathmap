export type RouterKind = "app" | "pages";

export interface Route {
  /** URL pattern in Next.js syntax, e.g. `/blog/[slug]`. */
  path: string;
  /** Names of the dynamic segments, in the order they appear in `path`. */
  params: string[];
  /** Source file, relative to the project root. */
  file: string;
  router: RouterKind;
}

const PAGES_SPECIAL_FILES = new Set(["_app", "_document", "_error"]);
const DYNAMIC_SEGMENT = /^\[{1,2}(?:\.{3})?([^.[\]]+)\]{1,2}$/;
const ROUTE_GROUP = /^\(.+\)$/;
const INTERCEPTING_SEGMENT = /^\(\.{1,3}\)/;

/**
 * Resolves a file inside a router directory to the URL it serves, or `null`
 * when the file does not produce a page route.
 */
export function resolveRoutePath(
  file: string,
  router: RouterKind,
  pageExtensions: readonly string[]
): string | null {
  const stem = stripPageExtension(file, pageExtensions);
  if (stem === null) return null;

  const segments = stem.split("/");
  return router === "app"
    ? resolveAppRoute(segments)
    : resolvePagesRoute(segments);
}

export function extractParams(path: string): string[] {
  return path.split("/").flatMap((segment) => {
    const name = DYNAMIC_SEGMENT.exec(segment)?.[1];
    return name === undefined ? [] : [name];
  });
}

function stripPageExtension(
  file: string,
  pageExtensions: readonly string[]
): string | null {
  const extension = [...pageExtensions]
    .sort((a, b) => b.length - a.length)
    .find((ext) => file.endsWith(`.${ext}`));

  return extension === undefined
    ? null
    : file.slice(0, -(extension.length + 1));
}

function resolvePagesRoute(segments: string[]): string | null {
  const [first] = segments;
  if (first === "api") return null;
  if (segments.length === 1 && PAGES_SPECIAL_FILES.has(first ?? "")) {
    return null;
  }

  return toPath(segments.at(-1) === "index" ? segments.slice(0, -1) : segments);
}

function resolveAppRoute(segments: string[]): string | null {
  if (segments.at(-1) !== "page") return null;

  const visible: string[] = [];
  for (const segment of segments.slice(0, -1)) {
    if (
      segment.startsWith("_") ||
      segment.startsWith("@") ||
      INTERCEPTING_SEGMENT.test(segment)
    ) {
      return null;
    }
    if (!ROUTE_GROUP.test(segment)) visible.push(segment);
  }

  return toPath(visible);
}

function toPath(segments: string[]): string {
  return `/${segments.join("/")}`;
}
