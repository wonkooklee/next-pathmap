#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { cac } from "cac";
import pc from "picocolors";
import { PathmapError } from "./errors.js";
import { generate, type GenerateResult } from "./generate.js";
import { init } from "./init.js";

interface GenerateFlags {
  cwd?: string;
  config?: string;
  check?: boolean;
}

const { version } = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as { version: string };

const cli = cac("next-pathmap");

cli
  .command("", "Generate the pathmap")
  .option("--cwd <dir>", "Project root")
  .option("--config <file>", "Config file to use")
  .option("--check", "Fail instead of writing when the pathmap is outdated")
  .action(async (flags: GenerateFlags) => {
    if (cli.args.length > 0) {
      usageError(`Unknown command "${cli.args.join(" ")}"`);
      return;
    }

    const cwd = resolve(flags.cwd ?? ".");
    const result = await generate({
      cwd,
      configFile: flags.config,
      write: !flags.check,
    });
    report(result, cwd, flags.check === true);
  });

cli
  .command("init", "Create pathmap.config.mjs for this project")
  .option("--cwd <dir>", "Project root")
  .action(async (flags: Pick<GenerateFlags, "cwd">) => {
    const cwd = resolve(flags.cwd ?? ".");
    const file = await init(cwd);
    console.log(`${pc.green("✔")} Created ${relative(cwd, file)}`);
  });

cli.help();
cli.version(version);

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  if (error instanceof Error && error.name === "CACError") {
    usageError(error.message);
  } else {
    fail(error);
  }
}

function report(result: GenerateResult, cwd: string, check: boolean): void {
  const output = relative(cwd, result.output);
  const count = pc.dim(
    `(${result.routes.length} route${result.routes.length === 1 ? "" : "s"})`
  );

  if (result.configFile) {
    console.log(pc.dim(`Using ${relative(cwd, result.configFile)}`));
  }

  if (!result.changed) {
    console.log(`${pc.green("✔")} ${output} is up to date ${count}`);
    return;
  }

  if (check) {
    printChanges(result);
    console.error(
      `${pc.red("✖")} ${output} is out of date. Run next-pathmap to update it.`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`${pc.green("✔")} Wrote ${output} ${count}`);
  printChanges(result);
}

function printChanges({ added, removed }: GenerateResult): void {
  for (const path of added) console.log(`  ${pc.green("+")} ${path}`);
  for (const path of removed) console.log(`  ${pc.red("-")} ${path}`);
}

function fail(error: unknown): void {
  process.exitCode = 1;

  if (error instanceof PathmapError) {
    console.error(`${pc.red("✖")} ${error.message}`);
    if (error.cause instanceof Error)
      console.error(pc.dim(error.cause.message));
    return;
  }
  console.error(error);
}

function usageError(message: string): void {
  process.exitCode = 1;
  console.error(`${pc.red("✖")} ${message}. Run next-pathmap --help.`);
}
