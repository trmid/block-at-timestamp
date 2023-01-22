# block-at-timestamp

Ethers Provider extension to quickly find a block close to a target timestamp.

## Installation

Install the package with the following command:

`npm i block-at-timestamp`

## Usage

### Example Usage:
```js
import { ethers } from "ethers";
import { blockAtTimestamp } from "block-at-timestamp";

let provider = new ethers.providers.JsonRpcProvider("https://rpc-provider.example/");
let timestamp = 1674420070; // unix timestamp in seconds
let block = await blockAtTimestamp(provider, timestamp);
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