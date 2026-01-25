import app from "./app";
import env from "./config/env";
import startGatewayListener from "./ethereum/gateway.listener";
import BridgeJob from "./jobs/bridge.job";
import WithdrawalJob from "./jobs/withdrawal.job";
import logger from "./utils/logger";


// Start listening to gateway events
startGatewayListener();

// Start bridge job
const bridgeJob = new BridgeJob();
bridgeJob.start(env.BRIDGE_JOB_INTERVAL || 60000);

// Start withdrawal job
const withdrawalJob = new WithdrawalJob();
withdrawalJob.start(env.BRIDGE_JOB_INTERVAL || 60000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  bridgeJob.stop();
  process.exit(0);
});

export default app;
