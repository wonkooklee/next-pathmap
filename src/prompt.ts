import inquirer from "inquirer";
import { resolve } from "node:path";
import { PathmapConfig, PathmapConfigType } from "./models.js";
import { checkFileExist } from "./check.js";
import { Print } from "./print.js";

export async function prompt() {
  if (checkFileExist("pathmap.config.js")) {
    Print.success("> pathmap.config.js has been detected.", {
      highlight: "background",
      spacing: true,
    });
    const config = await import(resolve("pathmap.config.js"));
    const result = validateConfig(config.default);
    return result;
  }

  Print.info("INFO: pathmap.config.js has not been found.", {
    highlight: "background",
    spacing: true,
  });

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

function validateConfig(config: PathmapConfigType) {
  const result = PathmapConfig.safeParse(config);

  if (result.success === false) {
    Print.error(`EXCEPTION: Invalid configuration. (1015)`, {
      highlight: "background",
      spacing: true,
    });
    Print.error(result.error?.issues, {
      highlight: "foreground",
    });

    process.exit(12);
  }

  return config;
}
