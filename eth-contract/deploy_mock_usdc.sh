#!/usr/bin/env bash
set -euo pipefail

# Deploy Mock USDC for testing on Base Sepolia
# Usage:
#   BASE_RPC_URL=https://sepolia.base.org \
#   DEPLOYER_PRIVATE_KEY=0x... \
#   ./deploy_mock_usdc.sh

FORGE_BIN=${FORGE:-forge}
SCRIPT_FQN="script/DeployMockUSDC.s.sol:DeployMockUSDC"

# Validate required environment variables
if [ -z "${BASE_RPC_URL:-}" ]; then
  echo "ERROR: BASE_RPC_URL environment variable not set"
  echo "Example: BASE_RPC_URL=https://sepolia.base.org"
  exit 1
fi

if [ -z "${DEPLOYER_PRIVATE_KEY:-}" ]; then
  echo "ERROR: DEPLOYER_PRIVATE_KEY environment variable not set"
  exit 1
fi

echo "=== Deploying Mock USDC to Base Sepolia ==="
echo "Building contracts..."
$FORGE_BIN build

echo ""
echo "Deploying Mock USDC..."
echo "RPC URL: $BASE_RPC_URL"
echo ""

# Run the script and broadcast the transaction
$FORGE_BIN script $SCRIPT_FQN \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast \
  -vvvv

echo ""
echo "=== Deployment Complete ==="
echo "Copy the MockUSDC address from above and update your .env file:"
echo "USDC_ADDRESS=<address_from_above>"
