import { describe, expect, it } from "vitest";
import { extractParams, resolvePagePath } from "../src/routes.js";

const extensions = ["tsx", "ts", "jsx", "js"];

describe("resolvePagePath", () => {
  it.each([
    ["index.tsx", "/"],
    ["about.tsx", "/about"],
    ["blog/index.tsx", "/blog"],
    ["blog/[slug].tsx", "/blog/[slug]"],
    ["docs/[...slug].jsx", "/docs/[...slug]"],
    ["shop/[[...slug]].js", "/shop/[[...slug]]"],
    ["404.tsx", "/404"],
  ])("maps %s to %s", (file, path) => {
    expect(resolvePagePath(file, extensions)).toBe(path);
  });

  it.each([
    "_app.tsx",
    "_document.tsx",
    "_error.tsx",
    "api/hello.ts",
    "api/users/[id].ts",
    "styles.module.css",
  ])("skips %s", (file) => {
    expect(resolvePagePath(file, extensions)).toBeNull();
  });

  it("only accepts the configured page extensions", () => {
    const pageExtensions = ["page.tsx", "page.ts"];

    expect(resolvePagePath("about.page.tsx", pageExtensions)).toBe("/about");
    expect(resolvePagePath("blog/index.page.ts", pageExtensions)).toBe("/blog");
    expect(resolvePagePath("_app.page.tsx", pageExtensions)).toBeNull();
    expect(resolvePagePath("Header.tsx", pageExtensions)).toBeNull();
  });

  it("strips the longest matching extension", () => {
    expect(resolvePagePath("about.page.tsx", ["tsx", "page.tsx"])).toBe(
      "/about"
    );
  });
});

describe("extractParams", () => {
  it.each([
    ["/", []],
    ["/about", []],
    ["/blog/[slug]", ["slug"]],
    ["/[locale]/docs/[...path]", ["locale", "path"]],
    ["/shop/[[...filters]]", ["filters"]],
    ["/users/[user-id]/posts/[post_id]", ["user-id", "post_id"]],
  ])("extracts params from %s", (path, params) => {
    expect(extractParams(path)).toEqual(params);
  });
});
