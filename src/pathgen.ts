import { existsSync, mkdirSync, readFileSync, writeFile } from "node:fs";
import { globby } from "globby";
import jsonFormat from "json-format";

function processing(paths, existingPaths, schema) {
  return paths.reduce((acc, path) => {
    const { query } = trimmingDynamicRoutes(path);
    acc[path] = {
      ...schema,
      ...existingPaths[path],
      query,
    };
    return acc;
  }, {});
}

function isDynamic(path) {
  return /\[(\.{3})?[\w\d-]+\]/.test(path);
}

function trimmingDynamicRoutes(path) {
  const query = isDynamic(path)
    ? path.match(/\[(\.{3})?[\w\d-]+\]/g)?.map((queryInDynamicSyntax) => {
        return queryInDynamicSyntax.replace(/\[(\.{3})?([\w\d-]+)\]/, "$2");
      })
    : [];

  return { query };
}

async function readExistPaths(pathToSave) {
  try {
    const files = await readFileSync(pathToSave, {
      encoding: "utf-8",
    });
    return JSON.parse(files);
  } catch (error) {
    return {};
  }
}

export async function gen({
  pathToPages,
  pathToSave,
  includes,
  excludes,
  schema,
}) {
  const pages = await globby([...includes, ...excludes], {
    cwd: pathToPages || "src/pages",
    absolute: false,
    caseSensitiveMatch: true,
    gitignore: true,
    objectMode: true,
  });

  if (pages.length === 0) {
    console.error(
      `\n`,
      "\x1b[41m",
      "EXCEPTION: The given directory has no matched page files. (1002)",
      "\x1b[0m",
      `\n`
    );
    process.exit(12);
  }

  mkdirRecursively(normalizeSavePath(pathToSave));

  const existingPaths = await readExistPaths(pathToSave);

  const parsedPaths = pages
    .map((page) => {
      return "/" + page.path.replace(/(\/?index)?\.page\.ts(x)?$/, "");
    })
    .sort((a, b) => {
      return a.localeCompare(b);
    });

  await writeFile(
    pathToSave,
    jsonFormat(processing(parsedPaths, existingPaths, schema)),
    { encoding: "utf-8" },
    (err) => {
      if (err) {
        console.error(
          `\n`,
          "\x1b[41m",
          "ERROR: Could not save the pathmap file to the given directory. (3002)",
          "\x1b[0m",
          `\n`
        );
        console.error(err);
        process.exit(12);
      } else {
        console.log(parsedPaths);
        console.log(
          `\n`,
          "\x1b[42m",
          "SUCCESS: Pathmap file has been created successfully.",
          "\x1b[0m",
          `\n`
        );
        console.log("\x1b[32m", `OUTPUT: ./${pathToSave}`, "\x1b[0m");
      }
    }
  );
}

function mkdirRecursively(pathToSave) {
  if (!existsSync(pathToSave)) {
    mkdirSync(pathToSave, {
      recursive: true,
    });
  }
}

function normalizeSavePath(path) {
  return path.replace(/(^\.\/|^\/|\/[\w\d-]+?\.json$)/g, "");
}
