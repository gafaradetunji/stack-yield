import { Contract } from 'ethers';
import { getProvider } from './provider.js';
import { prisma } from '../config/db.js';
import GatewayABI from './GatewayABI.json' assert { type: 'json' };
import { logger } from '../utils/logger.js';

const ethProvider = getProvider();

export function startGatewayListener() {
  const gateway = new Contract(
    process.env.DEPOSIT_GATEWAY_ADDRESS!,
    GatewayABI,
    ethProvider
  );

  gateway.on(
    'DepositReceived',
    async (user, amount, stacksAddress, depositId, event) => {
      try {
        await prisma.deposit.create({
          data: {
            ethTxHash: event.transactionHash,
            userEthAddress: user,
            stacksAddress: stacksAddress.toString(),
            amount: amount,
            feeAmount: amount * 20n / 10000n,
            netAmount: amount * 9980n / 10000n,
            status: 'RECEIVED',
          },
        });

        logger.info('Deposit indexed:', event.transactionHash);
      } catch (error) {
        logger.error('Error processing deposit event:', error);
      }
    }
  );

  logger.info('Gateway listener started');
}

export default startGatewayListener;
