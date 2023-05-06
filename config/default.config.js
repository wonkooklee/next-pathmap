export const defaultConfig = {
  pathToPages: "src/pages",
  pathToSave: "pathmap/pathmap.json",
  includes: ["**/*.page.{ts,tsx}"],
  excludes: ["!**/_*.{ts,tsx}", "!**/[A-Z]*.{ts,tsx}", "!api"],
  schema: {
    query: [],
    alias: "",
  },
};
