import fs from "node:fs";
import { globby } from "globby";
import jsonFormat from "json-format";

function processing(paths, existingPaths) {
  return paths.reduce((acc, path) => {
    const { query } = trimmingDynamicRoutes(path);
    acc[path] = {
      alias: "",
      trackPageView: true,
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
    const files = await fs.readFileSync(pathToSave, {
      encoding: "utf-8",
    });
    return JSON.parse(files);
  } catch (error) {
    return {};
  }
}

export async function gen({ pathToPages, pathToSave, includes, excludes }) {
  const pages = await globby([...includes, ...excludes], {
    cwd: pathToPages || "src/pages",
    absolute: false,
    caseSensitiveMatch: true,
    gitignore: true,
    objectMode: true,
  });

  if (pages.length === 0) {
    console.error(
      "\x1b[41m",
      "EXCEPTIONS: The given directory has no matched page files. (1002)"
    );
    process.exit(12);
  }

  const saveDir = pathToSave.match(/(.*?)(?=\/.+$)/)[0];

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir);
  }

  const existingPaths = await readExistPaths(pathToSave);

  const parsedPaths = pages
    .map((page) => {
      return "/" + page.path.replace(/(\/?index)?\.page\.ts(x)?$/, "");
    })
    .sort((a, b) => {
      return a.localeCompare(b);
    });

  console.log(parsedPaths);
  console.log(
    "\x1b[42m",
    "SUCCESS: Pathmap file has been created successfully.",
    "\x1b[0m"
  );
  console.log("\x1b[32m", `OUTPUT: ./${pathToSave}`, "\x1b[0m");

  fs.writeFile(
    pathToSave,
    jsonFormat(processing(parsedPaths, existingPaths)),
    { encoding: "utf-8" },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
}