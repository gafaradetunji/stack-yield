import { logger } from '../utils/logger.js';
import { prisma } from '../config/db.js';
import { withdrawFromStacking } from '../stacks/withdrawal.service.js';

export interface CreateWithdrawalInput {
  userAddress: string;
  amount: string;
}

export async function requestWithdrawal(depositId: string) {
  const deposit = await prisma.deposit.findUnique({ where: { id: depositId } });

  if (!deposit) throw new Error('Deposit not found');
  if (deposit.status !== 'STACKED') throw new Error('Deposit not withdrawable');

  // Broadcast to Stacks
  const txId = await withdrawFromStacking(deposit.netAmount, deposit.stacksAddress);

  // Update DB
  await prisma.$transaction([
    prisma.deposit.update({
      where: { id: depositId },
      data: { status: 'WITHDRAW_REQUESTED' },
    }),
    prisma.withdrawal.create({
      data: {
        depositId: depositId,
        stacksTxHash: txId,
        status: 'PENDING',
      },
    }),
  ]);

  logger.info(`Withdrawal requested for deposit ${depositId}, Stacks TxId: ${txId}`);
  return txId;
}

export class WithdrawalService {
  async createWithdrawal(input: CreateWithdrawalInput) {
    try {
      logger.info(`Creating withdrawal for ${input.userAddress} with amount ${input.amount}`);
      // Implementation for creating withdrawal in database
      return {};
    } catch (error) {
      logger.error('Error creating withdrawal:', error);
      throw error;
    }
  }

  async getWithdrawal(id: string) {
    try {
      logger.info(`Getting withdrawal ${id}`);
      // Implementation for getting withdrawal from database
      return null;
    } catch (error) {
      logger.error(`Error getting withdrawal ${id}:`, error);
      throw error;
    }
  }

  async getUserWithdrawals(userAddress: string) {
    try {
      logger.info(`Getting withdrawals for user ${userAddress}`);
      // Implementation for getting user withdrawals
      return [];
    } catch (error) {
      logger.error(`Error getting withdrawals for ${userAddress}:`, error);
      throw error;
    }
  }

  async updateWithdrawalStatus(id: string, status: string) {
    try {
      logger.info(`Updating withdrawal ${id} status to ${status}`);
      // Implementation for updating withdrawal status
      return {};
    } catch (error) {
      logger.error(`Error updating withdrawal ${id}:`, error);
      throw error;
    }
  }
}

export default WithdrawalService;
