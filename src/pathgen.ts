import { existsSync, mkdirSync, readFileSync, writeFile } from "node:fs";
import { globby } from "globby";
import jsonFormat from "json-format";
import { PathmapConfigType } from "./models";
import { Print } from "./print.js";

function processing(
  paths: string[],
  existingPaths: Record<string, any>,
  schema: Record<string, any>
) {
  return paths.reduce((acc, path: string) => {
    const { query } = trimmingDynamicRoutes(path);
    acc[path] = {
      ...schema,
      ...existingPaths[path],
      query,
    };
    return acc;
  }, {} as Record<string, any>);
}

function isDynamic(path: string) {
  return /\[(\.{3})?[\w\d-]+\]/.test(path);
}

function trimmingDynamicRoutes(path: string) {
  const query = isDynamic(path)
    ? path
        .match(/\[(\.{3})?[\w\d-]+\]/g)
        ?.map((queryInDynamicSyntax: string) => {
          return queryInDynamicSyntax.replace(/\[(\.{3})?([\w\d-]+)\]/, "$2");
        })
    : [];

  return { query };
}

async function readExistPaths(pathToSave: string) {
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
}: Required<PathmapConfigType>) {
  const pages = await globby([...includes, ...excludes], {
    cwd: pathToPages || "src/pages",
    absolute: false,
    caseSensitiveMatch: true,
    gitignore: true,
    objectMode: true,
  });

  if (pages.length === 0) {
    Print.error(
      "EXCEPTION: The given directory has no matched page files. (1002)",
      {
        highlight: "background",
        spacing: true,
      }
    );
    process.exit(12);
  }

  mkdirRecursively(normalizeSavePath(pathToSave));

  const existingPaths = await readExistPaths(pathToSave);

  const parsedPaths = pages
    .map((page) => {
      return (
        "/" +
        page.path.replace(
          /(\/?index)?((\.[\w\d-]+){1,})?\.(js|jsx|ts|tsx)$/,
          ""
        )
      );
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
        Print.error(
          "ERROR: Could not save the pathmap file to the given directory. (3002)",
          {
            highlight: "background",
            spacing: true,
          }
        );
        Print.error(err?.message, { highlight: "foreground" });
        process.exit(12);
      } else {
        Print.success(parsedPaths?.toString(), { highlight: "foreground" });
        Print.success("SUCCESS: Pathmap file has been created successfully.", {
          highlight: "background",
          spacing: true,
        });
        Print.success(`OUTPUT: ./${pathToSave}`, { highlight: "foreground" });
      }
    }
  );
}

function mkdirRecursively(pathToSave: string) {
  if (!existsSync(pathToSave)) {
    mkdirSync(pathToSave, {
      recursive: true,
    });
  }
}

function normalizeSavePath(path: string) {
  return path.replace(/(^\.\/|^\/|\/[\w\d-]+?\.json$)/g, "");
}
