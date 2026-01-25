import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { STACKS_TESTNET } from '@stacks/network';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const stacksNetwork = STACKS_TESTNET;

export class StacksClient {
  private client: AxiosInstance;

  constructor(rpcUrl: string = env.STACKS_RPC_URL) {
    this.client = axios.create({
      baseURL: rpcUrl,
      timeout: 30000,
    });
  }

  async getBlockHeight(): Promise<number> {
    try {
      const response = await this.client.get('/v2/info');
      return response.data.stacks_tip_height;
    } catch (error) {
      logger.error('Error getting block height:', error);
      throw error;
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    try {
      const response = await this.client.get(`/v2/accounts/${address}`);
      return response.data.balance;
    } catch (error) {
      logger.error(`Error getting balance for ${address}:`, error);
      throw error;
    }
  }

  async broadcastTransaction(tx: string): Promise<string> {
    try {
      const response = await this.client.post('/v2/transactions', tx, {
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      return response.data.txid;
    } catch (error) {
      logger.error('Error broadcasting transaction:', error);
      throw error;
    }
  }

  async getTransaction(txId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v2/transactions/${txId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      logger.error(`Error getting transaction ${txId}:`, error);
      throw error;
    }
  }
}

export default StacksClient;
