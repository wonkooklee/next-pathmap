import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig, resolveConfig } from "../src/config.js";
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
