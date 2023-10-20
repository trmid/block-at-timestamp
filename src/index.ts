import { Provider } from "@ethersproject/abstract-provider";
import { BatProvider, Block, RpcUrl, batProvider } from "./provider.js";

// Verbose state:
let _verbose = false;

/**
 * Set the verbose state of the blockAtTimestamp(...) function. If this
 * is true, the progress of the algorithm will be logged to the console.
 * 
 * @param verbose boolean
 */
export function setVerbose(verbose: boolean) {
  _verbose = verbose;
}

/**
 * Returns the verbose state of the blockAtTimestamp(...) function.
 * 
 * @returns boolean
 */
export function isVerbose() {
  return _verbose;
}

/**
 * Helper function to log a message if verbose.
 * @param message message string
 */
function logVerbose(message: string) {
  if(_verbose) console.log(`[blockAtTimestamp]: ${message}`);
}

function bigIntAbs(x: bigint) {
  return x < 0n ? x * -1n : x;
}

/**
 * Queries the provider for a block within the given time range of the 
 * target timestamp.
 * 
 * @param provider ethers Provider object
 * @param timestamp target timestamp in seconds
 * @param targetRangeSeconds maximum number of seconds that the returned
 *  block SHOULD lie within from the target timestamp. If no such block 
 *  exists, a block outside this range will be returned.
 *  
 *  default: 60 seconds
 * @returns a Block object close to the target timestamp
 */
export async function blockAtTimestamp(provider: Provider | string, timestamp: bigint | number, { targetRangeSeconds = 60 }) {
  const batp: BatProvider = batProvider(provider);
  const timestampAsBigInt = typeof timestamp === "number" ? BigInt(timestamp) : timestamp;
  const start = performance.now();
  try {
    logVerbose(`Looking for block at [${timestampAsBigInt}] sec, within range [${targetRangeSeconds}] sec...`);

    // Check if valid range was given:
    if(targetRangeSeconds < 1) throw new Error("targetRangeSeconds too small: must be at least 1 second");

    // Get starting block range:
    let lb = await batp.getBlock(0n);
    let ub = await batp.getBlock(await batp.getCurrentBlockNumber() - 1n); // some RPCs have trouble fetching block info by the most recent number, so we lag behind 1 block
    let estBlock = ub;

    // Check if target timestamp is outside of range:
    if(timestampAsBigInt <= lb.timestamp) {
      logVerbose(`Timestamp is less than earliest block. Returning block #${lb.number}.`);
      return lb;
    }
    if(timestampAsBigInt >= ub.timestamp) {
      logVerbose(`Timestamp is greater than latest block. Returning block #${ub.number}.`);
      return ub;
    }

    // Define helpers for verbose progress logging:
    let checks = 0;
    const formatBlock = (block: Block, name: string) => {
      return `[${name}: { block: ${block.number}, timestamp: ${block.timestamp}, diff: ${block.timestamp - timestampAsBigInt} }]`;
    };
    const logCheck = (estimate: Block) => {
      logVerbose(`(Check #${++checks}): \n\t${formatBlock(lb, "lowerBound")}\n\t${formatBlock(estimate, "  checking")}\n\t${formatBlock(ub, "upperBound")}`);
    };

    // Log first check:
    logCheck(estBlock);

    // Iterate, alternating between two methods, binary squeeze and block rate estimates:
    do {
      
      // Method 1: Binary squeeze:
      const mb = await batp.getBlock(lb.number + (ub.number - lb.number) / 2n);
      logCheck(mb);
      if(mb.timestamp > timestampAsBigInt) {
        ub = mb;
      } else if(mb.timestamp < timestampAsBigInt) {
        lb = mb;
      } else {
        logVerbose(`Found valid block during binary squeeze. Returning block #${mb.number}.`);
        return mb;
      }

      // Check if we have any blocks left to query:
      const blockDiff = ub.number - lb.number;
      if(blockDiff <= 1) {
        let closest = ub;
        if(bigIntAbs(lb.timestamp - timestampAsBigInt) < bigIntAbs(ub.timestamp - timestampAsBigInt)) closest = lb;
        logVerbose(`No more blocks to check. Returning closest block: #${closest.number}.`);
        return closest;
      }

      // Method 2: Estimate from avg block rate in new range:
      const timeDiff = ub.timestamp - lb.timestamp;
      const precision = BigInt(1e6);
      const avgSecBlock = precision * timeDiff / blockDiff;
      const estBlockNumber = (precision * (timestampAsBigInt - lb.timestamp)) / avgSecBlock + lb.number;
      estBlock = await batp.getBlock(estBlockNumber);
      logCheck(estBlock);
      if(estBlock.timestamp > timestampAsBigInt) {
        ub = estBlock;
      } else {
        lb = estBlock;
      }
    } while(bigIntAbs(estBlock.timestamp - timestampAsBigInt) > targetRangeSeconds);
    logVerbose(`Found valid block with block rate estimation. Returning block #${estBlock.number}.`);
    return estBlock;
  } catch(err) {
    if(_verbose) console.log(`Error: ${(err as any)?.message ?? err}`);
    throw err;
  } finally {
    logVerbose(`Completed search in ${performance.now() - start} ms.`);
  }
}