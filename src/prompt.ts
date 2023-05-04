import fs from "node:fs";
import inquirer from "inquirer";
import { PathmapConfig } from "./models.js";

export async function prompt() {
  try {
    const config = await fs.readFileSync("pathmap.config.json", {
      encoding: "utf-8",
    });

    if (config) {
      const validConf = validateConfig(config);
      return validConf;
    }
  } catch (error) {}

  console.log(`\n \x1b[33m > pathmap.config.json not founded. \x1b[0m \n`);

  return inquirer.prompt([
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
  const configuration = JSON.parse(config);
  const result = PathmapConfig.safeParse(configuration);

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

  return configuration;
}
