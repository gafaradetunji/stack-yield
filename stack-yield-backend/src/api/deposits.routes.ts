import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { formatUSDC } from '../utils/formatting.js';

const depositsRouter = Router();

// Get deposits by Ethereum address
depositsRouter.get('/:ethAddress', async (req: Request, res: Response) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userEthAddress: req.params.ethAddress as string },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDeposits = deposits.map(d => ({
      ...d,
      amount: formatUSDC(d.amount),
      feeAmount: formatUSDC(d.feeAmount),
      netAmount: formatUSDC(d.netAmount),
      // BigInt fields in database are now strings in the object
    }));

    return res.json(successResponse(formattedDeposits));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deposits';
    return res.status(500).json(errorResponse(message));
  }
});

export default depositsRouter;
