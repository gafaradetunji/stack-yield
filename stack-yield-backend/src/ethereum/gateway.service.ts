import { ethers } from 'ethers';
import { getProvider } from './provider.js';
import { logger } from '../utils/logger.js';

export interface GatewayTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export class GatewayService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = getProvider();
  }

  async getTransaction(txHash: string): Promise<GatewayTransaction | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) return null;

      const receipt = await this.provider.getTransactionReceipt(txHash);
      const status = receipt?.status === 1 ? 'confirmed' : receipt?.status === 0 ? 'failed' : 'pending';

      return {
        hash: tx.hash,
        from: tx.from!,
        to: tx.to || '',
        value: tx.value.toString(),
        status,
      };
    } catch (error) {
      logger.error(`Error getting transaction ${txHash}:`, error);
      return null;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error(`Error getting balance for ${address}:`, error);
      return '0';
    }
  }

  async markDepositBridged(depositId: string): Promise<string> {
    try {
      const signer = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, this.provider);
      const gateway = new ethers.Contract(
        process.env.DEPOSIT_GATEWAY_ADDRESS!,
        ['function markDepositBridged(bytes32 depositId) external'],
        signer
      );

      logger.info(`Marking deposit ${depositId} as bridged on Ethereum...`);
      const tx = await gateway.markDepositBridged(depositId);
      logger.info(`Mark bridged tx sent: ${tx.hash}`);

      // Wait for confirmation
      await tx.wait();
      logger.info(`Mark bridged tx confirmed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      logger.error(`Error marking deposit ${depositId} as bridged:`, error);
      throw error;
    }
  }

  async getDepositIdFromTx(txHash: string): Promise<string | null> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return null;

      const gatewayInterface = new ethers.Interface([
        'event DepositReceived(bytes32 indexed depositId, address indexed user, uint256 amount, bytes stacksAddress)'
      ]);

      for (const log of receipt.logs) {
        try {
          const parsedLog = gatewayInterface.parseLog(log);
          if (parsedLog && parsedLog.name === 'DepositReceived') {
            return parsedLog.args.depositId;
          }
        } catch (e) {
          // Ignore logs that don't match the interface
        }
      }
      return null;
    } catch (error) {
      logger.error(`Error extracting deposit ID from tx ${txHash}:`, error);
      return null;
    }
  }

  async adminWithdraw(depositId: string): Promise<string> {
    try {
      const signer = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, this.provider);
      const gateway = new ethers.Contract(
        process.env.DEPOSIT_GATEWAY_ADDRESS!,
        ['function adminWithdraw(bytes32 depositId) external'],
        signer
      );

      logger.info(`Admin withdrawing deposit ${depositId} on Ethereum...`);
      const tx = await gateway.adminWithdraw(depositId);
      logger.info(`Admin withdraw tx sent: ${tx.hash}`);

      await tx.wait();
      logger.info(`Admin withdraw tx confirmed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      logger.error(`Error in adminWithdraw for ${depositId}:`, error);
      throw error;
    }
  }
}

export default GatewayService;
