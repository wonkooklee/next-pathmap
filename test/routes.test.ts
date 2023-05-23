import { describe, expect, it } from "vitest";
import { extractParams, resolveRoutePath } from "../src/routes.js";

const extensions = ["tsx", "ts", "jsx", "js"];

describe("resolveRoutePath for the pages router", () => {
  it.each([
    ["index.tsx", "/"],
    ["about.tsx", "/about"],
    ["blog/index.tsx", "/blog"],
    ["blog/[slug].tsx", "/blog/[slug]"],
    ["docs/[...slug].jsx", "/docs/[...slug]"],
    ["shop/[[...slug]].js", "/shop/[[...slug]]"],
    ["404.tsx", "/404"],
  ])("maps %s to %s", (file, path) => {
    expect(resolveRoutePath(file, "pages", extensions)).toBe(path);
  });

  it.each([
    "_app.tsx",
    "_document.tsx",
    "_error.tsx",
    "api/hello.ts",
    "api/users/[id].ts",
    "styles.module.css",
  ])("skips %s", (file) => {
    expect(resolveRoutePath(file, "pages", extensions)).toBeNull();
  });

  it("only accepts the configured page extensions", () => {
    const pageExtensions = ["page.tsx", "page.ts"];

    expect(resolveRoutePath("about.page.tsx", "pages", pageExtensions)).toBe(
      "/about"
    );
    expect(
      resolveRoutePath("blog/index.page.ts", "pages", pageExtensions)
    ).toBe("/blog");
    expect(resolveRoutePath("_app.page.tsx", "pages", pageExtensions)).toBe(
      null
    );
    expect(resolveRoutePath("Header.tsx", "pages", pageExtensions)).toBeNull();
  });

  it("strips the longest matching extension", () => {
    expect(
      resolveRoutePath("about.page.tsx", "pages", ["tsx", "page.tsx"])
    ).toBe("/about");
  });
});

describe("resolveRoutePath for the app router", () => {
  it.each([
    ["page.tsx", "/"],
    ["dashboard/page.tsx", "/dashboard"],
    ["blog/[slug]/page.tsx", "/blog/[slug]"],
    ["(marketing)/about/page.tsx", "/about"],
    ["(shop)/(checkout)/cart/page.js", "/cart"],
  ])("maps %s to %s", (file, path) => {
    expect(resolveRoutePath(file, "app", extensions)).toBe(path);
  });

  it.each([
    "layout.tsx",
    "dashboard/loading.tsx",
    "api/route.ts",
    "_components/page.tsx",
    "blog/_lib/page.tsx",
    "@modal/login/page.tsx",
    "(.)photo/[id]/page.tsx",
    "feed/(..)photo/[id]/page.tsx",
    "feed/(...)photo/[id]/page.tsx",
  ])("skips %s", (file) => {
    expect(resolveRoutePath(file, "app", extensions)).toBeNull();
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
