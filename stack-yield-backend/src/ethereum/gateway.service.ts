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
}

export default GatewayService;
