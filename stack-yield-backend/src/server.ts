import { app } from './app.ts';
import { startGatewayListener } from './ethereum/gateway.listener.ts';
import { logger } from './utils/logger.ts';

// Start listening to gateway events
startGatewayListener();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
