import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveConfig } from "../src/config.js";
import { createProject, page, thrownBy } from "./utils.js";

describe("resolveConfig", () => {
  it("fills in defaults", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    expect(resolveConfig({}, cwd)).toEqual({
      cwd,
      pagesDir: join(cwd, "pages"),
      output: join(cwd, "pathmap/pathmap.json"),
      pageExtensions: ["tsx", "ts", "jsx", "js"],
      exclude: [],
      defaults: {},
      categories: undefined,
    });
  });

  it("prefers pages at the project root over src/pages", async () => {
    const cwd = await createProject({
      "pages/index.tsx": page,
      "src/pages/index.tsx": page,
    });

    expect(resolveConfig({}, cwd).pagesDir).toBe(join(cwd, "pages"));
  });

  it("falls back to src/pages", async () => {
    const cwd = await createProject({ "src/pages/index.tsx": page });

    expect(resolveConfig({}, cwd).pagesDir).toBe(join(cwd, "src/pages"));
  });

  it("uses an explicit pages directory", async () => {
    const cwd = await createProject({ "web/routes/index.tsx": page });

    expect(resolveConfig({ pagesDir: "web/routes" }, cwd).pagesDir).toBe(
      join(cwd, "web/routes")
    );
  });

  it("rejects a missing explicit directory", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    expect(
      thrownBy(() => resolveConfig({ pagesDir: "src/pages" }, cwd))
    ).toMatchObject({ code: "ROUTER_DIR_NOT_FOUND" });
  });

  it("rejects a project without a pages directory", async () => {
    const cwd = await createProject({ "README.md": "" });

    expect(thrownBy(() => resolveConfig({}, cwd))).toMatchObject({
      code: "ROUTER_DIR_NOT_FOUND",
    });
  });
});
