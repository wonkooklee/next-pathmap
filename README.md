<br />
<br />

<div align="center">
<figure><img src="https://user-images.githubusercontent.com/61101022/236479507-48e8efe0-55b8-4357-b24b-b552393286b7.png" alt="logo" width="160"></figure>

<h1> <b>next-pathmap</b>
</h1>

<p> Pathmap Generator for 'Pages' directory of Next.js </p>

</div>

<br />
<br />

`next-pathmap` is a tool that automatically extracts paths from the pages folder of the **next.js** project and converts them into `JSON` path-maps.  
It was created to manage all the metadata for each page in one file or to use as a hashmap.

<br />

## Requirements

- node.js >= 14.0.0

<br />

## Core dependencies

- [globby](https://github.com/sindresorhus/globby)
- [inquirer](https://github.com/SBoudrias/Inquirer.js)
- [json-format](https://github.com/luizstacio/json-format)

<br />

## Installations

You can run the binary without installation via the npx command. Or you can use it by installing it as a dependency.

```sh
$ npx next-pathmap
```
or
```sh
$ npm install -D next-pathmap
```
You can also enter the command directly through the global installation.
```sh
$ npm install -g next-path
$ next-path
```

<br />

## Configurations

To configure required properties you should define either use `pathmap.config.json` or configure via command-line input.  
If `pathmap.config.json` file is detected at the root of your project, script will use automatically as a configuration.

<br />

### 1. `pathmap.config.js` (Recommended)

```js
/** @type {import('next-pathmap/config').PathmapConfig} */
const PathmapConfig = {
  pathToPages: "src/pages",
  pathToSave: "src/pathmap/pathmap.json",
  includes: ["**/*.page.{ts,tsx}"],
  excludes: ["!**/_*.{ts,tsx}", "!**/[A-Z]*.{ts,tsx}", "!api"],
  schema: {
    /* properties you want */
  },
  categories: [
    {
      /* first matching segment map of the path */
      key: value,
    },
    {
      /* second matching segment map of the path */
      key: value,
    },
    // and so on...
  ],
};

module.exports = PathmapConfig;
```

<br />

### 2. Configure with command-line interface

You can configure with command-line interface unless you don't have configuration file.  
You can select only basic options compared to setting via config file.

```
? Enter the path to the '/pages' directory. src/pages
? Enter the destination to save jsonized pathmap file. pathmap/pathmap.json
? includes: **/*.page.{ts,tsx}
? excludes: **/[!_]*.{ts,tsx}, **/[!A-Z]*.page.{ts,tsx}, !api
.
.
```

<br />

## Result

All paths in the project are mapped to a JSON object as shown below. Use it as meta information on the page by importing it or refer to it as an alias in the path.

### Artifact

```json
{
  "/services/insurance": {
    "alias": "serv-insurance-page-viewed",
    "trackPageView": true,
    "categories": ["customer-service", "insurance/main"],
    "query": []
  },
  "/services/loan": {
    "alias": "serv-loan-page-viewed",
    "trackPageView": true,
    "categories": ["customer-service", "loan/main"],
    "query": []
  },
  "/services/products/[id]": {
    "alias": "serv-prod-id-page-viewed",
    "trackPageView": true,
    "categories": ["customer-service", "product/detail"],
    "query": ["id"]
  }
}
```

### Example
```js
import pathmap from '@/pathmap/pathmap.json';

export default function InsurancePage() {

  const pathInfo = pathmap['/services/insurance'];
  const pageAlias = pathInfo.alias;

  trackPageView({ pageName: pathInfo.categories.join('/') })
// ...


```



<br />

© WONKOOK LEE

<br />
