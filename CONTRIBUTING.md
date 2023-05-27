# Contributing

Thanks for taking the time to contribute. This document explains how to set up the project and what a pull request needs before it can be merged.

## Reporting bugs and proposing features

Open an issue using one of the templates. For bugs, include the version of `next-pathmap`, your Node.js version, the relevant part of your config, and the file tree that produces the wrong result. A minimal reproduction makes a fix much faster.

For larger changes, open an issue to discuss the approach before writing code.

## Development setup

The project uses the Node.js version in `.nvmrc` and npm.

```sh
git clone https://github.com/wonkooklee/next-pathmap.git
cd next-pathmap
npm ci
```

| Command              | What it does                  |
| -------------------- | ----------------------------- |
| `npm test`           | Runs the test suite once      |
| `npm run test:watch` | Runs tests in watch mode      |
| `npm run typecheck`  | Type-checks sources and tests |
| `npm run lint`       | Lints with ESLint             |
| `npm run format`     | Formats with Prettier         |
| `npm run build`      | Compiles to `dist`            |

To try the CLI against a local Next.js project, build and run it from that project:

```sh
npm run build
cd ../my-next-app
node ../next-pathmap/dist/cli.js
```

## Project structure

| Path              | Responsibility                                                       |
| ----------------- | -------------------------------------------------------------------- |
| `src/routes.ts`   | Maps a file to the URL it serves. Pure; all Next.js rules live here. |
| `src/pathmap.ts`  | Builds, merges, diffs and serializes the pathmap. Pure.              |
| `src/config.ts`   | Loads, validates and resolves the config.                            |
| `src/scan.ts`     | Finds route files on disk.                                           |
| `src/generate.ts` | Ties the pieces together and owns file I/O. Public API.              |
| `src/cli.ts`      | Parses arguments and prints results.                                 |

Keep Next.js routing rules in `src/routes.ts` and cover each rule with a test in `test/routes.test.ts`. Behavior that touches the file system is tested in `test/generate.test.ts` against temporary projects.

## Pull requests

- Add or update tests for every behavior change.
- Run `npm run lint`, `npm run typecheck` and `npm test` before pushing. CI runs the same checks on Linux and Windows with Node.js 16, 18 and 20.
- Update `README.md` when you change options or output, and add an entry to the `Unreleased` section of `CHANGELOG.md`.
- Write commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) format, for example `fix: skip intercepting routes`.

By participating in this project, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
