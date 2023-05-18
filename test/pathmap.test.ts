import { describe, expect, it } from "vitest";
import { buildPathmap, serializePathmap } from "../src/pathmap.js";
import { extractParams, type Route } from "../src/routes.js";

function route(path: string): Route {
  return { path, params: extractParams(path), file: "" };
}

describe("buildPathmap", () => {
  it("sorts routes by path", () => {
    const pathmap = buildPathmap([route("/b"), route("/"), route("/a/[id]")], {
      defaults: {},
      categories: undefined,
      previous: {},
    });

    expect(Object.keys(pathmap)).toEqual(["/", "/a/[id]", "/b"]);
  });

  it("layers defaults, previous entries and derived fields", () => {
    const pathmap = buildPathmap([route("/posts/[id]")], {
      defaults: { alias: "", trackPageView: false },
      categories: undefined,
      previous: {
        "/posts/[id]": { alias: "post-viewed", query: ["stale"], note: "kept" },
      },
    });

    expect(pathmap).toEqual({
      "/posts/[id]": {
        alias: "post-viewed",
        trackPageView: false,
        note: "kept",
        query: ["id"],
      },
    });
  });

  it("ignores previous entries that are not objects", () => {
    const pathmap = buildPathmap([route("/")], {
      defaults: { alias: "" },
      categories: undefined,
      previous: { "/": ["not", "an", "entry"] },
    });

    expect(pathmap["/"]).toEqual({ alias: "", query: [] });
  });

  it("labels segments by depth when categories are configured", () => {
    const pathmap = buildPathmap(
      [
        route("/services/insurance"),
        route("/services/unknown"),
        route("/constructor"),
      ],
      {
        defaults: {},
        categories: [{ services: "customer-service" }, { insurance: "main" }],
        previous: {},
      }
    );

    expect(pathmap["/services/insurance"]?.categories).toEqual([
      "customer-service",
      "main",
    ]);
    expect(pathmap["/services/unknown"]?.categories).toEqual([
      "customer-service",
    ]);
    expect(pathmap["/constructor"]?.categories).toEqual([]);
  });

  it("omits categories when they are not configured", () => {
    const pathmap = buildPathmap([route("/")], {
      defaults: {},
      categories: undefined,
      previous: {},
    });

    expect(pathmap["/"]).not.toHaveProperty("categories");
  });
});

describe("serializePathmap", () => {
  it("writes two-space indented JSON with a trailing newline", () => {
    expect(serializePathmap({ "/": { query: [] } })).toBe(
      '{\n  "/": {\n    "query": []\n  }\n}\n'
    );
  });
});
