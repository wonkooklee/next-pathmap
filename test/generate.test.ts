import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generate } from "../src/generate.js";
import { createProject, page } from "./utils.js";

async function readPathmap(cwd: string, output = "pathmap/pathmap.json") {
  return JSON.parse(await readFile(join(cwd, output), "utf8")) as unknown;
}

describe("generate", () => {
  it("writes the routes of the pages directory", async () => {
    const cwd = await createProject({
      "pages/index.tsx": page,
      "pages/products/[id].tsx": page,
      "pages/api/hello.ts": page,
      "pages/_app.tsx": page,
    });

    const result = await generate({ cwd });

    expect(result).toMatchObject({
      output: join(cwd, "pathmap/pathmap.json"),
      configFile: null,
      added: ["/", "/products/[id]"],
      removed: [],
      changed: true,
    });
    expect(result.routes.map(({ file }) => file)).toEqual([
      "pages/index.tsx",
      "pages/products/[id].tsx",
    ]);
    await expect(readPathmap(cwd)).resolves.toEqual({
      "/": { query: [] },
      "/products/[id]": { query: ["id"] },
    });
  });

  it("keeps hand-edited fields and drops deleted routes", async () => {
    const cwd = await createProject({
      "pages/index.tsx": page,
      "pages/blog/[slug].tsx": page,
      "pathmap/pathmap.json": JSON.stringify({
        "/": { alias: "home", query: [] },
        "/removed": { alias: "gone", query: [] },
      }),
    });

    const result = await generate({
      cwd,
      config: { defaults: { alias: "" } },
    });

    expect(result).toMatchObject({
      added: ["/blog/[slug]"],
      removed: ["/removed"],
    });
    await expect(readPathmap(cwd)).resolves.toEqual({
      "/": { alias: "home", query: [] },
      "/blog/[slug]": { alias: "", query: ["slug"] },
    });
  });

  it("leaves an up-to-date file untouched", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });
    await generate({ cwd });

    const result = await generate({ cwd });

    expect(result).toMatchObject({ changed: false, added: [], removed: [] });
  });

  it("does not write when write is false", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });

    const result = await generate({ cwd, write: false });

    expect(result.changed).toBe(true);
    await expect(readPathmap(cwd)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("uses the config file in the project root", async () => {
    const cwd = await createProject({
      "src/pages/index.page.tsx": page,
      "src/pages/Header.tsx": page,
      "src/pages/about.page.tsx": page,
      "src/pages/about.test.page.tsx": page,
      "pathmap.config.mjs": `export default {
        output: "src/routes.json",
        pageExtensions: ["page.tsx"],
        exclude: ["**/*.test.*"],
      };`,
    });

    const result = await generate({ cwd });

    expect(result.configFile).toBe(join(cwd, "pathmap.config.mjs"));
    await expect(readPathmap(cwd, "src/routes.json")).resolves.toEqual({
      "/": { query: [] },
      "/about": { query: [] },
    });
  });

  it("rejects a project without routes", async () => {
    const cwd = await createProject({ "pages/_app.tsx": page });

    await expect(generate({ cwd })).rejects.toMatchObject({
      code: "NO_ROUTES_FOUND",
    });
  });

  it("never overwrites an unreadable output file", async () => {
    const cwd = await createProject({ "pages/index.tsx": page });
    const output = join(cwd, "pathmap/pathmap.json");
    await generate({ cwd });
    await writeFile(output, "{ unfinished edit");

    await expect(generate({ cwd })).rejects.toMatchObject({
      code: "INVALID_OUTPUT_FILE",
    });
    await expect(readFile(output, "utf8")).resolves.toBe("{ unfinished edit");
  });
});
