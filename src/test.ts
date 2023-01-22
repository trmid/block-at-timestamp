import { blockAtTimestamp, setVerbose } from "./index.js";
import { ethers } from "ethers";

setVerbose(true);

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const main = async () => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const secondsInAWeek = 60 * 60 * 24 * 7;
  const oneWeekAgo = nowInSeconds - secondsInAWeek; // target timestamp
  const targetRangeSeconds = 60 * 60 * 24;
  const blockOneWeekAgo = await blockAtTimestamp(provider, oneWeekAgo, { targetRangeSeconds });
  console.log(blockOneWeekAgo);
};
main().catch(console.error);