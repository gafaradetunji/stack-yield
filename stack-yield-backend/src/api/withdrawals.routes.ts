import { Router } from 'express';
import type { Request, Response } from 'express';
import { requestWithdrawal } from '../services/withdrawal.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const withdrawalsRouter = Router();

// Request withdrawal for a deposit
withdrawalsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { depositId } = req.body;

    if (!depositId) {
      return res.status(400).json(errorResponse('depositId is required'));
    }

    await requestWithdrawal(depositId);
    return res.json(successResponse({ status: 'withdrawal_requested' }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to request withdrawal';
    return res.status(400).json(errorResponse(message));
  }
});

export default withdrawalsRouter;
