import { ethers } from 'ethers';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export type ProviderType = ethers.JsonRpcProvider | ethers.WebSocketProvider;

let provider: ProviderType;

export function getProvider(): ProviderType {
  if (!provider) {
    const url = process.env.ETH_RPC_URL || '';
    if (url.startsWith('wss')) {
      provider = new ethers.WebSocketProvider(url);
    } else {
      provider = new ethers.JsonRpcProvider(url);
    }
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
