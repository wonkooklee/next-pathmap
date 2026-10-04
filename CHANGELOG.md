# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 2.0.0 - 2026-10-04

### Breaking changes

- Config options were renamed: `pathToPages` → `pagesDir`, `pathToSave` → `output`, `includes` → `pageExtensions`, `excludes` → `exclude`, `schema` → `defaults`. Using an old name fails with a message that names its replacement.
- `exclude` patterns no longer take a leading `!`.
- The interactive prompt was removed. Use `next-pathmap init` to create a config file, or rely on the defaults.
- The `PathmapConfig` type is exported from `next-pathmap` instead of `next-pathmap/config`.
- The package is ESM only and requires Node.js 16.14 or later.

### Added

- App Router support, including route groups, private folders, parallel route slots and intercepting routes.
- `pageExtensions`, matching the option of the same name in `next.config.js`.
- Router directories are detected the way Next.js does when they are not configured.
- `next-pathmap init` writes a config file for the detected routers.
- `--check` fails without writing when the pathmap is out of date.
- `--cwd` and `--config` flags.
- `pathmap.config.mjs` and `pathmap.config.cjs` are loaded in addition to `pathmap.config.js`.
- A programmatic API: `generate()` and `PathmapError`.
- Added and removed routes are listed after each run.

### Fixed

- Generation fails when two files resolve to the same URL, instead of keeping one of them silently.
- An output file that is not valid JSON is no longer overwritten.
- The output file is only written when its content changes.
- Keys are sorted the same way regardless of the system locale.
- Config files are loaded correctly on Windows.
- Non-interactive environments such as CI no longer fail.

## 1.1.29 - 2023-05-07

### Fixed

- Type inference for the config file.
