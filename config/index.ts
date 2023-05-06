export interface PathmapConfig extends Record<string, any> {
  /**
   *  Indicate path of the `pages` folder from project's root. It's `src/pages` by default.
   *  ```js
   *  // example
   *  pathToPages: "src/pages"
   *  ```
   */
  pathToPages: string;
  /**
   *  Indicate path to save `pathmap` as a JSON file. It should be contain `*.json` extension explicitly.
   *  ```js
   *  // example
   *  pathToSave: "path/to/save.json"
   *  ```
   */
  pathToSave: string;
  /**
   *  Glob patterns to retrieve the list of `page components` under the `pages` directory.
   *  ```js
   *  // example
   *  includes: [ "**\/*.path.{ts,tsx}" ]
   *  ```
   */
  includes: string[];
  /**
   *  Glob patterns to exclude from the list of `page components`.
   *  ```js
   *  // example
   *  excludes: [ "!**\/*._*.page.{ts,tsx}", "!api" ]
   *  ```
   */
  excludes: string[];
  /**
   *  Configurable user-defined template to use as properties of each path.
   *  It could be a meta-data for respective path or page-view event name, whatever.
   *  ```js
   *  // example
   *  schema: {
   *    query: [], // required; not configurable,
   *    alias: "",
   *    pageDescription: "",
   *    // ...
   *  }
   *  ```
   */
  schema: Record<string, any> & {
    alias?: string;
    meta?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  };
  /**
   *  Extract segments as semantic strings.
   */
  categorize?: {
    [key: string]: any;
  }[];
}
