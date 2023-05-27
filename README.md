<div align="center">
  <img src="https://user-images.githubusercontent.com/61101022/236479507-48e8efe0-55b8-4357-b24b-b552393286b7.png" alt="" width="160" />
  <h1>next-pathmap</h1>
  <p>Generate a JSON map of every route in a Next.js project.</p>

[![npm](https://img.shields.io/npm/v/next-pathmap)](https://www.npmjs.com/package/next-pathmap)
[![CI](https://github.com/wonkooklee/next-pathmap/actions/workflows/ci.yml/badge.svg)](https://github.com/wonkooklee/next-pathmap/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/next-pathmap)](./LICENSE)

</div>

`next-pathmap` walks the `app` and `pages` directories of a Next.js project, resolves each file to the URL it serves, and writes the result to a JSON file. Every route gets an entry you can extend with your own fields, such as analytics event names, page titles or feature ownership, so that metadata lives next to the list of routes instead of being scattered across pages.

```json
{
  "/": {
    "alias": "home-viewed",
    "query": []
  },
  "/blog/[slug]": {
    "alias": "blog-post-viewed",
    "query": ["slug"]
  }
}
```

Running it again adds new routes and removes deleted ones while keeping the fields you edited by hand.

## Requirements

- Node.js 16.14 or later
- Next.js with the Pages Router, the App Router, or both

## Getting started

```sh
npm install --save-dev next-pathmap
npx next-pathmap init
npx next-pathmap
```

`init` detects your router directories and writes `pathmap.config.mjs`. Running `next-pathmap` with no command generates the pathmap. A config file is optional; without one, the defaults below apply.

To keep the pathmap current, run it before `dev` and `build`:

```json
{
  "scripts": {
    "predev": "next-pathmap",
    "prebuild": "next-pathmap"
  }
}
```

## Configuration

`next-pathmap` looks for `pathmap.config.js`, `pathmap.config.mjs` or `pathmap.config.cjs` in the project root. Use `--config` to load another file.

```js
/** @type {import("next-pathmap").PathmapConfig<{ alias: string; trackPageView: boolean }>} */
export default {
  pagesDir: "src/pages",
  output: "src/pathmap.json",
  pageExtensions: ["page.tsx", "page.ts"],
  exclude: ["**/*.test.*"],
  defaults: {
    alias: "",
    trackPageView: true,
  },
  categories: [
    { services: "customer-service" },
    { insurance: "insurance/main" },
  ],
};
```

| Option           | Default                      | Description                                                                                                                                    |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `appDir`         | `app`, then `src/app`        | App Router directory. `false` skips it.                                                                                                        |
| `pagesDir`       | `pages`, then `src/pages`    | Pages Router directory. `false` skips it.                                                                                                      |
| `output`         | `"pathmap/pathmap.json"`     | File to write. Must end with `.json`.                                                                                                          |
| `pageExtensions` | `["tsx", "ts", "jsx", "js"]` | Same as `pageExtensions` in `next.config.js`. Keep the two in sync.                                                                            |
| `exclude`        | `[]`                         | Glob patterns, relative to each router directory, for files that are not routes.                                                               |
| `defaults`       | `{}`                         | Fields every entry starts with.                                                                                                                |
| `categories`     | none                         | Lookup tables per path depth. `categories[i][segment]` labels the i-th segment of a route, and the matched labels are written to `categories`. |

When `appDir` and `pagesDir` are omitted, directories are detected the same way Next.js does: `app` and `pages` in the project root take precedence, and `src` is only checked when neither exists there.

## How routes are resolved

The rules follow Next.js routing, so the pathmap lists the URLs your app actually serves.

**Pages Router.** Every file with a page extension is a route. `index` maps to its parent directory. `_app`, `_document`, `_error` and everything under `api` are skipped.

**App Router.** Only `page` files are routes. Route groups such as `(marketing)` are removed from the path. Private folders (`_components`), parallel route slots (`@modal`) and intercepting routes (`(.)photo`) are skipped because they do not define URLs of their own.

**Dynamic segments.** `[id]`, `[...slug]` and `[[...slug]]` stay in the key as written, and their names are listed in `query`.

If two files resolve to the same URL, for example `pages/about.tsx` and `app/(site)/about/page.tsx`, generation fails and names both files.

## How entries are merged

Each entry is built from three layers. Later layers win:

1. `defaults` from the config.
2. The entry already in the output file, including any fields edited by hand.
3. Fields derived from the route: `query`, and `categories` when configured.

Routes that no longer exist are removed. Keys are sorted, and the file is only written when its content changes, so repeated runs do not touch the file or trigger a reload in `next dev`.

If the existing output file is not valid JSON, generation stops instead of replacing it, so hand-written data is never lost to a merge conflict.

## Checking in CI

```sh
npx next-pathmap --check
```

`--check` writes nothing. It lists added and removed routes and exits with code 1 when the committed pathmap is out of date.

## CLI

```
next-pathmap [options]        Generate the pathmap
next-pathmap init [options]   Create pathmap.config.mjs

Options:
  --cwd <dir>      Project root (default: current directory)
  --config <file>  Config file to use
  --check          Fail instead of writing when the pathmap is outdated
  -h, --help       Display help
  -v, --version    Display the version
```

## Programmatic API

```ts
import { generate, PathmapError } from "next-pathmap";

try {
  const result = await generate({ cwd: process.cwd(), write: false });
  console.log(result.added, result.removed, result.changed);
} catch (error) {
  if (error instanceof PathmapError) console.error(error.code, error.message);
  else throw error;
}
```

`generate` accepts `cwd`, `config` (inline configuration that skips the config file), `configFile` and `write`. It resolves to the pathmap, the resolved routes, the output path, the routes that were added and removed, and whether the file changed. Every expected failure is a `PathmapError` with a stable `code`.

The package is ESM only.

## Contributing

Bug reports and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © Wonkook Lee
