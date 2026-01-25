import { makeContractCall, broadcastTransaction, uintCV, principalCV } from '@stacks/transactions';
import { logger } from '../utils/logger.js';
import { stacksNetwork } from './stacks.client.js';

export interface StackingInfo {
  amount: string;
  cycles: number;
  poxAddress: string;
}

export async function stackFunds(
  amount: bigint,
  userStacksAddress: string
) {
  try {
    const tx = await makeContractCall({
      contractAddress: process.env.STACKS_CONTRACT_ADDRESS!,
      contractName: 'stacking-pool',
      functionName: 'stack-for-user',
      functionArgs: [
        principalCV(userStacksAddress),
        uintCV(amount)
      ],
      senderKey: process.env.STACKS_PRIVATE_KEY!,
      network: stacksNetwork,
    });

    const result = await broadcastTransaction({ transaction: tx, network: stacksNetwork });
    if ('error' in result && result.error) {
      throw new Error(`Stacks broadcast failed: ${result.error} ${result.reason || ''}`);
    }
    return (result as any).txid || (result as any).tx_id;
  } catch (error) {
    logger.error('Error in stackFunds:', error);
    throw error;
  }
}

export class StackingService {
  async startStacking(info: StackingInfo): Promise<string> {
    try {
      logger.info(`Starting stacking with amount: ${info.amount}`);
      // Implementation for stacking logic
      return '';
    } catch (error) {
      logger.error('Error starting stacking:', error);
      throw error;
    }
  }

  async getStackingStatus(address: string): Promise<any> {
    try {
      logger.info(`Getting stacking status for ${address}`);
      // Implementation for getting stacking status
      return {};
    } catch (error) {
      logger.error(`Error getting stacking status for ${address}:`, error);
      throw error;
    }
  }

  async unstackTokens(address: string): Promise<string> {
    try {
      logger.info(`Unstacking tokens for ${address}`);
      // Implementation for unstacking logic
      return '';
    } catch (error) {
      logger.error(`Error unstacking for ${address}:`, error);
      throw error;
    }
  }
}

export default StackingService;
