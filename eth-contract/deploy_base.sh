#!/usr/bin/env bash
set -euo pipefail

# Deploy script for eth-contract using Foundry (`forge`).
# Usage:
#   BASE_RPC_URL=https://base-rpc.example.org \
#   DEPLOYER_PRIVATE_KEY=0x... \
#   FORGE=forge \
#   ./deploy_base.sh

FORGE_BIN=${FORGE:-forge}
SCRIPT_FQN=${SCRIPT_FQN:-script/Counter.s.sol:CounterScript}

if [ -z "${BASE_RPC_URL:-}" ] || [ -z "${DEPLOYER_PRIVATE_KEY:-}" ]; then
  echo "ERROR: set BASE_RPC_URL and DEPLOYER_PRIVATE_KEY environment variables"
  echo "Example: BASE_RPC_URL=https://base-mainnet.rpc your_key=0x... $0"
  exit 1
fi

echo "Building contracts..."
$FORGE_BIN build

echo "Running deploy script $SCRIPT_FQN on Base RPC: $BASE_RPC_URL"

# Run the script and broadcast the transaction(s).
$FORGE_BIN script $SCRIPT_FQN \
  --rpc-url "$BASE_RPC_URL" \
  --private-key "$DEPLOYER_PRIVATE_KEY" \
  --broadcast

echo "Done. Check the broadcasted transaction in the output above or on the Base block explorer."
