import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Ethereum
  ETH_RPC_URL: process.env.ETH_RPC_URL || '',
  ETH_PRIVATE_KEY: process.env.ETH_PRIVATE_KEY || '',
  ETH_CHAIN_ID: parseInt(process.env.ETH_CHAIN_ID || '1'),
  DEPOSIT_GATEWAY_ADDRESS: process.env.DEPOSIT_GATEWAY_ADDRESS || '',
  USDC_ADDRESS: process.env.USDC_ADDRESS || '',
  TREASURY_ADDRESS: process.env.TREASURY_ADDRESS || '',

  // Stacks
  STACKS_RPC_URL: process.env.STACKS_RPC_URL || '',
  STACKS_NETWORK: process.env.STACKS_NETWORK || 'testnet',

  // API Keys
  API_KEY: process.env.API_KEY || '',

  // Job Configuration
  BRIDGE_JOB_INTERVAL: parseInt(process.env.BRIDGE_JOB_INTERVAL || '60000'), // 1 minute
  YIELD_JOB_INTERVAL: parseInt(process.env.YIELD_JOB_INTERVAL || '300000'), // 5 minutes
};

export default env;
