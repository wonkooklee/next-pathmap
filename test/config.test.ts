import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig, resolveConfig } from "../src/config.js";
import { createProject, page, thrownBy } from "./utils.js";

describe("resolveConfig", () => {
  it("fills in defaults", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    expect(resolveConfig({}, cwd)).toEqual({
      cwd,
      routers: [{ kind: "pages", dir: join(cwd, "pages") }],
      output: join(cwd, "pathmap/pathmap.json"),
      pageExtensions: ["tsx", "ts", "jsx", "js"],
      exclude: [],
      defaults: {},
      categories: undefined,
    });
  });

  it("detects both routers at the project root", async () => {
    const cwd = await createProject({
      "app/page.tsx": page,
      "pages/about.tsx": page,
    });

    expect(resolveConfig({}, cwd).routers).toEqual([
      { kind: "app", dir: join(cwd, "app") },
      { kind: "pages", dir: join(cwd, "pages") },
    ]);
  });

  it("falls back to src only when the root has no router", async () => {
    const cwd = await createProject({
      "src/app/page.tsx": page,
      "src/pages/about.tsx": page,
    });

    expect(resolveConfig({}, cwd).routers).toEqual([
      { kind: "app", dir: join(cwd, "src/app") },
      { kind: "pages", dir: join(cwd, "src/pages") },
    ]);

    const mixed = await createProject({
      "pages/index.tsx": page,
      "src/app/page.tsx": page,
    });

    expect(resolveConfig({}, mixed).routers).toEqual([
      { kind: "pages", dir: join(mixed, "pages") },
    ]);
  });

  it("skips a router set to false", async () => {
    const cwd = await createProject({
      "app/page.tsx": page,
      "pages/about.tsx": page,
    });

    expect(resolveConfig({ appDir: false }, cwd).routers).toEqual([
      { kind: "pages", dir: join(cwd, "pages") },
    ]);
  });

  it("uses explicit router directories", async () => {
    const cwd = await createProject({ "web/routes/index.tsx": page });

    expect(resolveConfig({ pagesDir: "web/routes" }, cwd).routers).toEqual([
      { kind: "pages", dir: join(cwd, "web/routes") },
    ]);
  });

  it("rejects a missing explicit directory", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    expect(
      thrownBy(() => resolveConfig({ pagesDir: "src/pages" }, cwd))
    ).toMatchObject({ code: "ROUTER_DIR_NOT_FOUND" });
  });

  it("rejects a project without routers", async () => {
    const cwd = await createProject({ "README.md": "" });

    expect(thrownBy(() => resolveConfig({}, cwd))).toMatchObject({
      code: "ROUTER_DIR_NOT_FOUND",
    });
  });

  it("points 1.x options to their replacements", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    expect(() =>
      resolveConfig({ pathToPages: "pages", pathToSave: "a.json" }, cwd)
    ).toThrowError(/pathToPages -> pagesDir\n {2}- pathToSave -> output/);
  });
});

describe("loadConfig", () => {
  it("returns null without a config file", async () => {
    const cwd = await createProject({});

    await expect(loadConfig(cwd)).resolves.toBeNull();
  });

  it.each([
    ["pathmap.config.mjs", "export default { output: 'a.json' };"],
    ["pathmap.config.cjs", "module.exports = { output: 'a.json' };"],
  ])("loads %s", async (name, source) => {
    const cwd = await createProject({ [name]: source });

    await expect(loadConfig(cwd)).resolves.toEqual({
      config: { output: "a.json" },
      file: join(cwd, name),
    });
  });

  it("loads an explicit config file", async () => {
    const cwd = await createProject({
      "pathmap.config.mjs": "export default { output: 'a.json' };",
      "config/pathmap.mjs": "export default { output: 'b.json' };",
    });

    await expect(loadConfig(cwd, "config/pathmap.mjs")).resolves.toEqual({
      config: { output: "b.json" },
      file: join(cwd, "config/pathmap.mjs"),
    });
  });

  it("rejects a missing explicit config file", async () => {
    const cwd = await createProject({});

    await expect(loadConfig(cwd, "pathmap.mjs")).rejects.toMatchObject({
      code: "CONFIG_LOAD_FAILED",
    });
  });

  it("wraps errors thrown while importing", async () => {
    const cwd = await createProject({
      "pathmap.config.mjs": "throw new Error('boom');",
    });

    await expect(loadConfig(cwd)).rejects.toMatchObject({
      code: "CONFIG_LOAD_FAILED",
      cause: expect.objectContaining({ message: "boom" }) as unknown,
    });
  });

  it("requires a default export", async () => {
    const cwd = await createProject({
      "pathmap.config.mjs": "export const config = {};",
    });

    await expect(loadConfig(cwd)).rejects.toMatchObject({
      code: "INVALID_CONFIG",
    });
  });
});
