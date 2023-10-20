import { Provider } from "@ethersproject/abstract-provider";

/**
 * Defines a basic provider object with the minimum interface required for this
 * library to interact with.
 */
export interface BatProvider {
  getCurrentBlockNumber: () => Promise<bigint>
  getBlock: (blockNumber: bigint) => Promise<Block>
}

/**
 * Interface for a Block object.
 */
export interface Block {
  number: bigint,
  timestamp: bigint
}

/**
 * Type definition for an RPC URL string.
 */
export type RpcUrl = string;

/**
 * A conversion function that attempts to convert an RPC integration into
 * a BatProvider.
 * @param integration An ethers abstract provider or an RPC URL
 * @returns BatProvider
 */
export const batProvider = (integration: Provider | RpcUrl) => {
  if (typeof integration === "string") {
    return rpcBatProvider(integration);
  } else {
    return ethersBatProvider(integration);
  }
}

/**
 * An adapter to create a BatProvider from an ethers abstract provider.
 * @param provider Ethers Abstract Provider
 * @returns BatProvider
 */
export const ethersBatProvider = (provider: Provider) => {
  return {
    getCurrentBlockNumber: async () => {
      return BigInt(await provider.getBlockNumber());
    },
    getBlock: async (blockNumber: bigint) => {
      return { number: blockNumber, timestamp: BigInt((await provider.getBlock(Number(blockNumber))).timestamp) };
    }
  } satisfies BatProvider
};

/**
 * An adapter to create a BatProvider from an RPC URL.
 * @param rpc RPC URL
 * @returns BatProvider
 */
export const rpcBatProvider = (rpc: RpcUrl) => {
  let callId = 0;
  return {
    getCurrentBlockNumber: async () => {
      const res = await fetch(rpc, {
        method: "POST",
        body: JSON.stringify({
          jsonrpc:"2.0",
          method: "eth_blockNumber",
          params: [],
          id: callId++
        })
      });
      if (res.status == 200) {
        const data = await res.json();
        if (data.result !== undefined && data.result !== null) {
          return BigInt(data.result);
        } else {
          throw new Error(`Failed to fetch current block from RPC URL. response: ${JSON.stringify(data)}`);
        }
      } else {
        throw new Error(`Failed to fetch current block from RPC URL. status: ${res.status}: ${res.statusText}`);
      }
    },
    getBlock: async (blockNumber: bigint) => {
      const res = await fetch(rpc, {
        method: "POST",
        body: JSON.stringify({
          jsonrpc:"2.0",
          method: "eth_getBlockByNumber",
          params: [
            `0x${blockNumber.toString(16)}`,
            false
          ],
          id: callId++
        })
      });
      if (res.status == 200) {
        const data = await res.json();
        if (data.result !== undefined && data.result !== null) {
          return { number: blockNumber, timestamp: BigInt(data.result.timestamp) };
        } else {
          throw new Error(`Failed to fetch block timestamp for block ${blockNumber} from RPC URL. response: ${JSON.stringify(data)}`);
        }
      } else {
        throw new Error(`Failed to fetch block timestamp for block ${blockNumber} from RPC URL. status: ${res.status}: ${res.statusText}`);
      }
    }
  } satisfies BatProvider;
};