import { requestWithdrawal } from '../stack-yield-backend/src/services/withdrawal.service.ts';
import { prisma } from '../stack-yield-backend/src/config/db.ts';

jest.mock('../stack-yield-backend/src/config/db.ts');
jest.mock('../stack-yield-backend/src/stacks/withdrawal.service.ts');

describe('Withdrawal Service', () => {
  it('rejects non-stacked deposits', async () => {
    (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      status: 'RECEIVED',
    });

    await expect(requestWithdrawal('1')).rejects.toThrow('Deposit not withdrawable');
  });

  it('marks deposit as withdraw requested', async () => {
    (prisma.deposit.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      status: 'STACKED',
      netAmount: 100n,
      stacksAddress: 'ST123',
    });

    (prisma.deposit.update as jest.Mock).mockResolvedValue(true);

    await requestWithdrawal('1');

    expect(prisma.deposit.update).toHaveBeenCalled();
  });
});
