import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig, resolveConfig } from "../src/config.js";
import { init } from "../src/init.js";
import { createProject, page } from "./utils.js";

describe("init", () => {
  it("writes a config for the detected routers", async () => {
    const cwd = await createProject({
      "src/app/page.tsx": page,
      "src/pages/about.tsx": page,
    });

    const file = await init(cwd);

    expect(file).toBe(join(cwd, "pathmap.config.mjs"));
    expect(await readFile(file, "utf8")).toBe(
      [
        '/** @type {import("next-pathmap").PathmapConfig} */',
        "export default {",
        '  appDir: "src/app",',
        '  pagesDir: "src/pages",',
        '  output: "pathmap/pathmap.json",',
        "  defaults: {},",
        "};",
        "",
      ].join("\n")
    );
  });

  it("writes a config that loads and validates", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });
    await init(cwd);

    const loaded = await loadConfig(cwd);

    expect(resolveConfig(loaded?.config, cwd).routers).toEqual([
      { kind: "pages", dir: join(cwd, "pages") },
    ]);
  });

  it("refuses to replace an existing config", async () => {
    const cwd = await createProject({
      "pages/index.tsx": page,
      "pathmap.config.js": "module.exports = {};",
    });

    await expect(init(cwd)).rejects.toMatchObject({ code: "CONFIG_EXISTS" });
  });

  it("requires a router directory", async () => {
    const cwd = await createProject({});

    await expect(init(cwd)).rejects.toMatchObject({
      code: "ROUTER_DIR_NOT_FOUND",
    });
  });
});
