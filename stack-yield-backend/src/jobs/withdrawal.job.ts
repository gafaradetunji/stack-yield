import { logger } from '../utils/logger.js';
import { prisma } from '../config/db.js';
import { StacksClient } from '../stacks/stacks.client.js';
import { GatewayService } from '../ethereum/gateway.service.js';

export class WithdrawalJob {
    private stacksClient: StacksClient;
    private gatewayService: GatewayService;
    private isRunning = false;

    constructor() {
        this.stacksClient = new StacksClient();
        this.gatewayService = new GatewayService();
    }

    async start(intervalMs: number): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info(`Withdrawal job started with interval ${intervalMs}ms`);

        setInterval(() => this.execute(), intervalMs);
        await this.execute();
    }

    private async execute(): Promise<void> {
        try {
            const pendingWithdrawals = await prisma.withdrawal.findMany({
                where: { status: 'PENDING' },
                include: { deposit: true },
            });

            if (pendingWithdrawals.length > 0) {
                logger.info(`Found ${pendingWithdrawals.length} pending withdrawals`);
            }

            for (const withdrawal of pendingWithdrawals) {
                await this.processWithdrawal(withdrawal);
            }
        } catch (error) {
            logger.error('Withdrawal job execution failed:', error);
        }
    }

    private async processWithdrawal(withdrawal: any): Promise<void> {
        const { id, stacksTxHash, deposit } = withdrawal;

        if (!stacksTxHash) return;

        try {
            const tx = await this.stacksClient.getTransaction(stacksTxHash);

            if (!tx) {
                logger.warn(`Stacks transaction ${stacksTxHash} not found yet`);
                return;
            }

            if (tx.tx_status === 'success') {
                logger.info(`Stacks withdrawal confirmed for ${id}. Releasing on Ethereum...`);

                // 1. Get on-chain Deposit ID
                const onChainDepositId = await this.gatewayService.getDepositIdFromTx(deposit.ethTxHash);

                if (!onChainDepositId) {
                    logger.error(`Could not find on-chain deposit ID for withdrawal ${id}`);
                    return;
                }

                // 2. Call adminWithdraw on Ethereum
                const ethTxHash = await this.gatewayService.adminWithdraw(onChainDepositId);

                // 3. Update Status
                await prisma.$transaction([
                    prisma.withdrawal.update({
                        where: { id },
                        data: { status: 'COMPLETED', ethTxHash },
                    }),
                    prisma.deposit.update({
                        where: { id: deposit.id },
                        data: { status: 'WITHDRAWN', withdrawnAt: new Date() },
                    }),
                ]);

                logger.info(`Withdrawal ${id} completed successfully. Eth Tx: ${ethTxHash}`);
            } else if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') {
                logger.error(`Stacks transaction ${stacksTxHash} failed: ${tx.tx_status}`);
                await prisma.withdrawal.update({
                    where: { id },
                    data: { status: 'FAILED' },
                });
            }
        } catch (error) {
            logger.error(`Error processing withdrawal ${id}:`, error);
        }
    }

    stop(): void {
        this.isRunning = false;
        logger.info('Withdrawal job stopped');
    }
}

export default WithdrawalJob;
