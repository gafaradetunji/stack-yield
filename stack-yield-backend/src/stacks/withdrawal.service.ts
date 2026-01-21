import { makeContractCall, broadcastTransaction } from '@stacks/transactions';
import { stacksNetwork } from './stacks.client.js';
import { logger } from '../utils/logger.js';

export async function withdrawFromStacking(
  amount: bigint,
  userStacksAddress: string
) {
  try {
    const tx = await makeContractCall({
      contractAddress: process.env.STACKS_CONTRACT_ADDRESS!,
      contractName: 'stacking-pool',
      functionName: 'withdraw',
      functionArgs: [],
      senderKey: process.env.STACKS_PRIVATE_KEY!,
      network: stacksNetwork,
    });

    const result = await broadcastTransaction({ transaction: tx, network: stacksNetwork });
    logger.info(`Withdrawal broadcast successfully for ${userStacksAddress}`);
    return result;
  } catch (error) {
    logger.error('Error withdrawing from stacking:', error);
    throw error;
  }
}

export default withdrawFromStacking;
