export interface Route {
  /** URL pattern in Next.js syntax, e.g. `/blog/[slug]`. */
  path: string;
  /** Names of the dynamic segments, in the order they appear in `path`. */
  params: string[];
  /** Source file, relative to the project root. */
  file: string;
}

const SPECIAL_FILES = new Set(["_app", "_document", "_error"]);
const DYNAMIC_SEGMENT = /^\[{1,2}(?:\.{3})?([^.[\]]+)\]{1,2}$/;

/**
 * Resolves a file inside the pages directory to the URL it serves, or `null`
 * when the file does not produce a page route.
 */
export function resolvePagePath(
  file: string,
  pageExtensions: readonly string[]
): string | null {
  const stem = stripPageExtension(file, pageExtensions);
  if (stem === null) return null;

  const segments = stem.split("/");
  const [first] = segments;
  if (first === "api") return null;
  if (segments.length === 1 && SPECIAL_FILES.has(first ?? "")) return null;

  return toPath(segments.at(-1) === "index" ? segments.slice(0, -1) : segments);
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

function toPath(segments: string[]): string {
  return `/${segments.join("/")}`;
}
