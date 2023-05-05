import { gen } from "./pathgen.js";
import { prompt } from "./prompt.js";

export async function pathmap() {
  if (process.stdout.isTTY === false) {
    console.error("\x1b[41m", "ERROR: Something went wrong. (3000)", "\x1b[0m");
    process.exit(1);
  }

  const { pathToPages, pathToSave, includes, excludes, schema } =
    await prompt();

  validatePaths({ pathToPages, pathToSave });

  gen({
    pathToPages,
    pathToSave,
    includes: Array.isArray(includes) ? [...includes] : [includes],
    excludes,
    schema,
  });
}

function validatePaths({ pathToPages, pathToSave }) {
  const isValidPathToPages = /^((\/|\.|\.{2}|[\w\d]).+)?pages$/.test(
    pathToPages
  );
  const isValidPathToSave = /^((\/|\.|\.{2}|[\w\d]).+)?[\w\d-]\.json$/.test(
    pathToSave
  );

  if (!isValidPathToPages) {
    console.error(
      `\n`,
      "\x1b[41m",
      `EXCEPTION: The given path '${pathToPages}' is invalid. (1012)`,
      "\x1b[0m",
      `\n`
    );
    process.exit(12);
  } else if (!isValidPathToSave) {
    console.error(
      `\n`,
      "\x1b[41m",
      `EXCEPTION: The given path '${pathToSave}' is invalid. (1013)`,
      "\x1b[0m",
      `\n`
    );
    process.exit(12);
  }
}
