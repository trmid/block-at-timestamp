import { blockAtTimestamp, setVerbose } from "./index.js";
import { ethers } from "ethers";

setVerbose(true);

const main = async () => {
  if (!process.env.RPC_URL) throw new Error("Missing RPC_URL env var!");
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const secondsInAWeek = 60 * 60 * 24 * 7;
  const oneWeekAgo = nowInSeconds - secondsInAWeek; // target timestamp
  const targetRangeSeconds = 60 * 60 * 24;
  const blockOneWeekAgoRpc = await blockAtTimestamp(process.env.RPC_URL, oneWeekAgo, { targetRangeSeconds });
  const blockOneWeekAgoProvider = await blockAtTimestamp(provider, oneWeekAgo, { targetRangeSeconds });
  console.log({
    rpcRes: blockOneWeekAgoRpc,
    providerRes: blockOneWeekAgoProvider
  });
};
main().catch(console.error);