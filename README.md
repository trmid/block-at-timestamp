# block-at-timestamp

![version](https://img.shields.io/badge/dynamic/json?color=brightgreen&label=npm&logo=npm&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftrmid%2Fblock-at-timestamp%2Fmain%2Fpackage.json&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fblock-at-timestamp)
![typescript](https://img.shields.io/static/v1?label&logo=typescript&logoColor=white&message=TypeScript&color=blue)
![ethers](https://img.shields.io/static/v1?label&logo=ethereum&logoColor=white&message=ethers.js&color=gray&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fethers)

Quickly find a block close to a target timestamp using an RPC URL or ethers Provider.

## Installation

Install the package with the following command:

`npm i block-at-timestamp`

## Usage

### Example Usage:
```js
import { blockAtTimestamp } from "block-at-timestamp";

let timestamp = 1674420070; // unix timestamp in seconds
let block = await blockAtTimestamp("https://rpc-provider.example/", timestamp);
```

### Optional Target Range:

By default, the algorithm will attempt to find a block within 60 seconds of the target timestamp. If you want a faster result with less accuracy, you can increase the `targetRangeSeconds` parameter like so:

```js
await blockAtTimestamp(provider, timestamp, {
  targetRangeSeconds: 60 * 60 // one hour
});
```

### Debugging:

To see logs for debugging purposes, you can enable verbose logging with the following:

```js
import { setVerbose } from "block-at-timestamp";

setVerbose(true);
```
