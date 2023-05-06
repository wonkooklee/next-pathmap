import { gen } from "./pathgen.js";
import { Print } from "./print.js";
import { prompt } from "./prompt.js";

export async function pathmap() {
  if (process.stdout.isTTY === false) {
    Print.error("ERROR: Something went wrong. (3000)", {
      highlight: "background",
      spacing: false,
    });
    process.exit(1);
  }

  const {
    pathToPages,
    pathToSave,
    includes,
    excludes,
    schema,
    categories = [],
  } = await prompt();

  validatePaths({ pathToPages, pathToSave });

  gen({
    pathToPages,
    pathToSave,
    includes: Array.isArray(includes) ? includes : [includes],
    excludes,
    schema,
    categories,
  });
}

function validatePaths({
  pathToPages,
  pathToSave,
}: {
  pathToPages: string;
  pathToSave: string;
}) {
  const isValidPathToPages = /^((\/|\.|\.{2}|[\w\d]).+)?pages$/.test(
    pathToPages
  );
  const isValidPathToSave = /^((\/|\.|\.{2}|[\w\d]).+)?[\w\d-]\.json$/.test(
    pathToSave
  );

  if (isValidPathToPages && isValidPathToSave) return;

  Print.error(
    !isValidPathToPages
      ? `EXCEPTION: The given path '${pathToPages}' is invalid. (1012)`
      : `EXCEPTION: The given path '${pathToSave}' is invalid. (1013)`,
    { highlight: "background", spacing: true }
  );

  process.exit(12);
}
