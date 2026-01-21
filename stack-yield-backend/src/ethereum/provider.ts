import { ethers } from 'ethers';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let provider: ethers.JsonRpcProvider;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
  }
  return provider;
}

export const ethProvider = getProvider();

export async function validateProvider(): Promise<boolean> {
  try {
    const blockNumber = await getProvider().getBlockNumber();
    logger.info(`Provider validated, current block: ${blockNumber}`);
    return true;
  } catch (error) {
    logger.error('Provider validation failed:', error);
    return false;
  }
}

export default getProvider;
