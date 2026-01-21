import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const depositsRouter = Router();

// Get deposits by Ethereum address
depositsRouter.get('/:ethAddress', async (req: Request, res: Response) => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userEthAddress: req.params.ethAddress },
    });

    return res.json(successResponse(deposits));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deposits';
    return res.status(500).json(errorResponse(message));
  }
});

export default depositsRouter;
