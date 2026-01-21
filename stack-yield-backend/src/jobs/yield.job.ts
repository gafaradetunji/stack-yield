import { logger } from '../utils/logger.js';
import { YieldService } from '../services/yield.service.js';

export class YieldJob {
  private yieldService: YieldService;
  private isRunning = false;

  constructor() {
    this.yieldService = new YieldService();
  }

  async start(intervalMs: number): Promise<void> {
    if (this.isRunning) {
      logger.warn('Yield job is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Yield job started with interval ${intervalMs}ms`);

    setInterval(() => this.execute(), intervalMs);

    // Run immediately on start
    await this.execute();
  }

  private async execute(): Promise<void> {
    try {
      logger.info('Yield job executing');
      // Implementation for yield calculation and distribution logic
    } catch (error) {
      logger.error('Yield job execution failed:', error);
    }
  }

  stop(): void {
    this.isRunning = false;
    logger.info('Yield job stopped');
  }
}

export default YieldJob;
