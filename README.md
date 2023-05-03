# Making Node CLI Tool for generating pathmap

## Requirements

- node.js >= 16
- npm >= 8

## How to use

npx script running fashion.

```sh
npx demo-npm-cli-tool
```

Interactive CLI Dialogs.

```sh
? Enter the path to the '/pages' directory. src/pages
? Enter the destination to save jsonized pathmap file. pathmap/pathmap.json
? includes: **/*.page.{ts,tsx}
? excludes: **/[!_]*.{ts,tsx}, **/[!A-Z]*.page.{ts,tsx}, !api
```

## Result

```json
{
  "/": {
    "alias": "",
    "trackPageView": true,
    "query": []
  },
  "/services/loan": {
    "alias": "",
    "trackPageView": true,
    "query": []
  }
}
```

© WONKOOK LEE
