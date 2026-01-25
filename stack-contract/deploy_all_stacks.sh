#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env"
  export $(grep -v '^#' .env | xargs)
fi

# Deploy all Stack Yield contracts to Stacks testnet
# Usage:
#   STACKS_NETWORK=testnet \
#   SENDER_ADDRESS=ST... \
#   SENDER_PRIVATE_KEY=your-hex-key \
#   ./deploy_all_stacks.sh

# Validate required environment variables
if [ -z "${STACKS_NETWORK:-}" ]; then
  echo "ERROR: STACKS_NETWORK environment variable not set"
  echo "Example: STACKS_NETWORK=testnet"
  exit 1
fi

if [ -z "${SENDER_ADDRESS:-}" ]; then
  echo "ERROR: SENDER_ADDRESS environment variable not set"
  echo "Example: SENDER_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
  exit 1
fi

if [ -z "${SENDER_PRIVATE_KEY:-}" ]; then
  echo "ERROR: SENDER_PRIVATE_KEY environment variable not set"
  exit 1
fi

echo "=== Stack Yield Contracts Deployment to Stacks Testnet ==="
echo "Network: $STACKS_NETWORK"
echo "Deployer: $SENDER_ADDRESS"
echo ""

# Deploy all contracts in order
# Order matters: vault first, then supporting contracts
export CONTRACTS="vault,swap-manager,stacking-pool,rewards-ledger"

echo "Deploying contracts: $CONTRACTS"
echo ""

# Run the TypeScript deployment script
npx tsx deploy_stacks.ts

echo ""
echo "=== Deployment Complete ==="
echo "Check the terminal output for contract identifiers."
echo "View transactions on Stacks Explorer: https://explorer.hiro.so/?chain=$STACKS_NETWORK"
