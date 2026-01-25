import { Contract, ethers } from 'ethers';
import { getProvider } from './provider.js';
import { prisma } from '../config/db.js';
import GatewayABI from './GatewayABI.json' assert { type: 'json' };
import { logger } from '../utils/logger.js';

const ethProvider = getProvider();
let lastProcessedBlock: number = 0;

export function startGatewayListener() {
  const gateway = new Contract(
    process.env.DEPOSIT_GATEWAY_ADDRESS!,
    GatewayABI,
    ethProvider
  );

  gateway.on(
    'DepositReceived',
    async (depositId, user, amount, stacksAddress, event) => {
      try {
        const txHash = event?.transactionHash || event?.log?.transactionHash;
        logger.info(`Live event received. Hash: ${txHash}`, { depositId: depositId.toString(), user, args: [depositId, user, amount, stacksAddress] });

        if (!txHash) {
          logger.error('Could not extract transaction hash from event object', event);
          return;
        }

        await prisma.deposit.create({
          data: {
            ethTxHash: txHash,
            userEthAddress: user,
            stacksAddress: stacksAddress,
            amount: amount,
            feeAmount: amount * 20n / 10000n,
            netAmount: amount * 9980n / 10000n,
            status: 'RECEIVED',
            user: {
              connectOrCreate: {
                where: { ethAddress: user },
                create: {
                  ethAddress: user,
                  stacksAddress: stacksAddress,
                },
              },
            },
          },
        });

        logger.info('Deposit indexed:', event.transactionHash);
      } catch (error) {
        logger.error('Error processing deposit event:', error);
      }
    }
  );

  logger.info('Gateway listener started');

  // Initial sync
  syncPastEvents(gateway).catch(err => logger.error('Initial sync failed:', err));

  // Periodic polling fallback (every 30 seconds)
  setInterval(() => {
    syncPastEvents(gateway).catch(err => logger.error('Periodic polling failed:', err));
  }, 30000);
}

async function syncPastEvents(gateway: Contract) {
  try {
    const currentBlock = await ethProvider.getBlockNumber();

    // Start from lastProcessedBlock or a safe range (last 1000 blocks) on first run
    const fromBlock = lastProcessedBlock === 0
      ? Math.max(0, currentBlock - 1000)
      : lastProcessedBlock - 5; // Overlap by 5 blocks for safety

    if (fromBlock > currentBlock) return;

    logger.info(`[Sync] Scanning block range ${fromBlock} to ${currentBlock}...`);
    const events = await gateway.queryFilter('DepositReceived', fromBlock, currentBlock);

    if (events.length > 0) {
      logger.info(`[Sync] Found ${events.length} events in range`);
    }

    // Update lastProcessedBlock after fetch
    lastProcessedBlock = currentBlock;

    for (const event of events) {
      if ('args' in event) {
        const [depositId, user, amount, stacksAddress] = event.args;
        const txHash = event.transactionHash;

        // Check if already exists
        const existing = await prisma.deposit.findUnique({
          where: { id: depositId } // depositId should rely on the keccak256 ID from contract
          // But schema currently uses UUID likely.
          // Let's check schema. If ID is UUID, we can't use on-chain ID as primary key unless we changed schema.
          // Wait, contract emits `depositId` (bytes32). 
          // Listener code: `async (user, amount, stacksAddress, depositId, event) => ...`
          // Listener create: `data: { ..., ethTxHash: ... }` NO explicit `id`.
          // If `id` in DB is `String @id @default(uuid())`, then we have a problem connecting on-chain ID to DB ID unless we store it.
          // Checking the existing code: it saves `ethTxHash`. 
          // Let's rely on `findFirst({ where: { ethTxHash: ... } })` to avoid duplicates.
        });

        const exists = await prisma.deposit.findFirst({
          where: { ethTxHash: txHash }
        });

        if (!exists) {
          try {
            await prisma.deposit.create({
              data: {
                ethTxHash: txHash,
                userEthAddress: user,
                stacksAddress: stacksAddress,
                amount: amount,
                feeAmount: amount * 20n / 10000n,
                netAmount: amount * 9980n / 10000n,
                status: 'RECEIVED',
                user: {
                  connectOrCreate: {
                    where: { ethAddress: user },
                    create: {
                      ethAddress: user,
                      stacksAddress: stacksAddress.toString(),
                    },
                  },
                },
              },
            });
            logger.info(`Backfilled deposit: ${txHash}`);
          } catch (e) {
            logger.error(`Failed to backfill ${txHash}:`, e);
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error during historical sync:', error);
  }
}

export default startGatewayListener;
