import { Router } from 'express';
import type { Request, Response } from 'express';
import { requestWithdrawal } from '../services/withdrawal.service.js';
import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { formatUSDC } from '../utils/formatting.js';

const withdrawalsRouter = Router();

// Request withdrawal for a deposit
withdrawalsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { depositId } = req.body;

    if (!depositId) {
      return res.status(400).json(errorResponse('depositId is required'));
    }

    const txId = await requestWithdrawal(depositId);
    return res.json(successResponse({ status: 'withdrawal_requested', txId }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request withdrawal';
    return res.status(400).json(errorResponse(message));
  }
});

// Get withdrawals by Ethereum address
withdrawalsRouter.get('/:ethAddress', async (req: Request, res: Response) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        deposit: {
          userEthAddress: req.params.ethAddress as string,
        },
      },
      include: {
        deposit: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedWithdrawals = withdrawals.map(w => ({
      ...w,
      deposit: {
        ...w.deposit,
        amount: formatUSDC(w.deposit.amount),
        feeAmount: formatUSDC(w.deposit.feeAmount),
        netAmount: formatUSDC(w.deposit.netAmount),
      }
    }));

    return res.json(successResponse(formattedWithdrawals));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch withdrawals';
    return res.status(500).json(errorResponse(message));
  }
});

export default withdrawalsRouter;
