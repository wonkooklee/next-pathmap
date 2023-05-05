import inquirer from "inquirer";
import { resolve } from "node:path";
import { PathmapConfig } from "./models.js";
import { checkConfigExist } from "./check.js";

export async function prompt() {
  if (checkConfigExist()) {
    console.log(
      `\n \x1b[42m > pathmap.config.js has been detected. \x1b[0m \n`
    );
    const config = await import(resolve("pathmap.config.js"));
    const result = validateConfig(config.default);
    return result;
  }

  console.log(`\n \x1b[33m > pathmap.config.js has not been found. \x1b[0m \n`);

  return await inquirer.prompt([
    {
      type: "input",
      name: "pathToPages",
      message: "Enter the path to the '/pages' directory.",
      default: "src/pages",
    },
    {
      type: "input",
      name: "pathToSave",
      message: "Enter the destination to save jsonized pathmap file.",
      default: "pathmap/pathmap.json",
    },
    {
      type: "list",
      name: "includes",
      choices: [
        {
          checked: true,
          name: "**/*.page.{ts,tsx}",
          value: "**/*.page.{ts,tsx}",
        },
        {
          checked: false,
          name: "**/*.{ts,tsx}",
          value: "**/*.{ts,tsx}",
        },
        {
          checked: false,
          name: "**/*.page.{js,jsx}",
          value: "**/*.page.{js,jsx}",
        },
        {
          checked: false,
          name: "**/*.{js,jsx}",
          value: "**/*.{js,jsx}",
        },
      ],
    },
    {
      type: "checkbox",
      name: "excludes",
      choices: [
        {
          checked: true,
          name: "!**/_*.{ts,tsx}",
          value: "!**/_*.{ts,tsx}",
        },
        {
          checked: true,
          name: "!**/[A-Z]*.{ts,tsx}",
          value: "!**/[A-Z]*.{ts,tsx}",
        },
        {
          checked: true,
          name: "!api",
          value: "!api",
        },
      ],
    },
  ]);
}

function validateConfig(config) {
  const result = PathmapConfig.safeParse(config);

  if (result.success === false) {
    console.error(
      `\n`,
      "\x1b[41m",
      `EXCEPTION: Invalid configuration. (1015)`,
      "\x1b[0m"
    );
    console.error(result.error.issues);
    process.exit(12);
  }

  return config;
}
