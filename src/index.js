#!/usr/bin/env node

import inquirer from "inquirer";
import { gen } from "./pathgen.js";

inquirer
  .prompt([
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
  ])
  .then(async ({ pathToPages, pathToSave, includes, excludes }) => {
    console.log({ pathToPages, pathToSave, includes: [includes], excludes });
    gen({
      pathToPages,
      pathToSave,
      includes: [includes],
      excludes,
    });
  });
