import { makeContractCall, broadcastTransaction, uintCV, principalCV } from '@stacks/transactions';
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
      functionName: 'unstake-for-user',
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

    const txId = (result as any).txid || (result as any).tx_id;
    logger.info(`Withdrawal broadcast successfully. TxId: ${txId}`);
    return txId;
  } catch (error) {
    logger.error('Error withdrawing from stacking:', error);
    throw error;
  }
}

export default withdrawFromStacking;
