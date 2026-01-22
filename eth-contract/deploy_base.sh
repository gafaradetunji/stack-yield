#!/usr/bin/env bash
set -euo pipefail

# Deploy script for Stack Yield contracts to Base Sepolia using Foundry
# Usage:
#   BASE_RPC_URL=https://sepolia.base.org \
#   DEPLOYER_PRIVATE_KEY=0x... \
#   USDC_ADDRESS=0x... \
#   ./deploy_base.sh

FORGE_BIN=${FORGE:-forge}
SCRIPT_FQN=${SCRIPT_FQN:-script/DeployBase.s.sol:DeployBase}

# Validate required environment variables
if [ -z "${BASE_RPC_URL:-}" ]; then
  echo "ERROR: BASE_RPC_URL environment variable not set"
  echo "Example: BASE_RPC_URL=https://sepolia.base.org"
  exit 1
fi

if [ -z "${DEPLOYER_PRIVATE_KEY:-}" ]; then
  echo "ERROR: DEPLOYER_PRIVATE_KEY environment variable not set"
  echo "Example: DEPLOYER_PRIVATE_KEY=0x..."
  exit 1
fi

if [ -z "${USDC_ADDRESS:-}" ]; then
  echo "ERROR: USDC_ADDRESS environment variable not set"
  echo "Example: USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e (Base Sepolia USDC)"
  exit 1
fi

echo "=== Stack Yield Deployment to Base Sepolia ==="
echo "Building contracts..."
$FORGE_BIN build

echo ""
echo "Deploying contracts to Base Sepolia..."
echo "RPC URL: $BASE_RPC_URL"
echo ""

# Run the script and broadcast the transaction(s).
if [ -n "${BASESCAN_API_KEY:-}" ]; then
  echo "BaseScan API key provided, will attempt verification..."
  $FORGE_BIN script $SCRIPT_FQN \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$DEPLOYER_PRIVATE_KEY" \
    --broadcast \
    --verify \
    --etherscan-api-key "$BASESCAN_API_KEY" \
    -vvvv
else
  echo "No BaseScan API key provided, skipping verification..."
  $FORGE_BIN script $SCRIPT_FQN \
    --rpc-url "$BASE_RPC_URL" \
    --private-key "$DEPLOYER_PRIVATE_KEY" \
    --broadcast \
    -vvvv
fi

echo ""
echo "=== Deployment Complete ==="
echo "Check the deployment addresses above and save them for your configuration."
echo "View on BaseScan: https://sepolia.basescan.org/"
