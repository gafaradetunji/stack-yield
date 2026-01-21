import { logger } from '../utils/logger.js';
import { prisma } from '../config/db.js';
import { DepositService } from '../services/deposit.service.js';
import { WithdrawalService } from '../services/withdrawal.service.js';
import { stackFunds } from '../stacks/stacking.service.js';

export async function processBridge(depositId: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });
  if (!deposit) return;

  try {
    await stackFunds(deposit.netAmount, deposit.stacksAddress);

    await prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'STACKED', stackedAt: new Date() },
    });

    logger.info(`Deposit ${depositId} successfully stacked`);
  } catch (error) {
    logger.error(`Error processing bridge for deposit ${depositId}:`, error);
    throw error;
  }
}

export class BridgeJob {
  private depositService: DepositService;
  private withdrawalService: WithdrawalService;
  private isRunning = false;

  constructor() {
    this.depositService = new DepositService();
    this.withdrawalService = new WithdrawalService();
  }

  async start(intervalMs: number): Promise<void> {
    if (this.isRunning) {
      logger.warn('Bridge job is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Bridge job started with interval ${intervalMs}ms`);

    setInterval(() => this.execute(), intervalMs);

    // Run immediately on start
    await this.execute();
  }

  private async execute(): Promise<void> {
    try {
      logger.info('Bridge job executing');
      // Implementation for bridge logic
    } catch (error) {
      logger.error('Bridge job execution failed:', error);
    }
  }

  stop(): void {
    this.isRunning = false;
    logger.info('Bridge job stopped');
  }
}

export default BridgeJob;
