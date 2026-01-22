# Stack Yield Deployment Guide

This guide provides step-by-step instructions for deploying the Stack Yield protocol contracts to Base Sepolia (Ethereum) and Stacks Testnet.

## Prerequisites

### For Ethereum Deployment (Base Sepolia)
- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed (`foundryup`)
- Base Sepolia testnet ETH for gas fees
- USDC address on Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- (Optional) BaseScan API key for contract verification

### For Stacks Deployment (Testnet)
- [Clarinet](https://github.com/hirosystems/clarinet) installed
- Node.js v16+ and npm
- Stacks testnet STX for deployment fees
- TypeScript dependencies installed

## Installation

```bash
# Clone the repository
cd /home/gafar/solidity-practice/new-stacks-yield

# Install Ethereum dependencies
cd eth-contract
forge install

# Install Stacks dependencies
cd ../stack-contract
npm install
```

## Ethereum Deployment to Base Sepolia

### 1. Configure Environment

Copy the example environment file and fill in your values:

```bash
cd eth-contract
cp .env.example .env
```

Edit `.env`:
```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://sepolia.base.org
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
BASESCAN_API_KEY=your_basescan_api_key_here  # Optional
```

### 2. Test Build

```bash
forge build
```

### 3. Deploy Contracts

The deployment script will deploy both contracts in order:
1. **Treasury** - Fee collector and manager
2. **EthDepositGateway** - USDC deposit entry point

```bash
# Load environment variables
source .env

# Run deployment
./deploy_base.sh
```

### 4. Verify Deployment

The script will output the deployed contract addresses:
```
=== Deployment Summary ===
Treasury: 0x...
EthDepositGateway: 0x...
```

**Save these addresses!** You'll need them for:
- Frontend configuration
- Backend integration
- Cross-chain bridge setup

View on BaseScan:
- Treasury: `https://sepolia.basescan.org/address/<TREASURY_ADDRESS>`
- EthDepositGateway: `https://sepolia.basescan.org/address/<GATEWAY_ADDRESS>`

## Stacks Deployment to Testnet

### 1. Configure Environment

Copy the example environment file and fill in your values:

```bash
cd stack-contract
cp .env.example .env
```

Edit `.env`:
```bash
STACKS_NETWORK=testnet
SENDER_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM  # Your testnet address
SENDER_PRIVATE_KEY=your_private_key_here
```

### 2. Verify Contracts

```bash
clarinet check
```

### 3. Deploy All Contracts

The deployment script will deploy all 4 contracts in the correct order:
1. **vault** - User USDC balance management
2. **swap-manager** - USDCx ↔ STX conversion
3. **stacking-pool** - STX staking tracker
4. **rewards-ledger** - User reward balance and claims

```bash
# Load environment variables
source .env

# Run batch deployment
./deploy_all_stacks.sh
```

### 4. Monitor Deployment

The script will:
- Deploy each contract sequentially
- Wait 3 seconds between deployments
- Show progress with emojis (📄, ✅, ❌)
- Save deployment info to a JSON file

Example output:
```
=== Stack Yield Contracts Deployment ===
Network: testnet
Deployer: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM

📄 Deploying vault...
   ✅ Success! TxID: 0xabc123...

📄 Deploying swap-manager...
   ✅ Success! TxID: 0xdef456...
```

### 5. Verify Deployment

Check the deployment summary:
```
=== Deployment Summary ===
✅ vault: 0xabc123...
   View: https://explorer.hiro.so/txid/0xabc123...?chain=testnet
✅ swap-manager: 0xdef456...
   View: https://explorer.hiro.so/txid/0xdef456...?chain=testnet
...
```

A JSON file will be created with all deployment details:
```bash
cat deployment-testnet-<timestamp>.json
```

**Save the contract identifiers!** Format: `<SENDER_ADDRESS>.<CONTRACT_NAME>`

Example:
```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.swap-manager
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stacking-pool
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.rewards-ledger
```

## Alternative: Deploy Single Stacks Contract

If you need to deploy or redeploy a single contract:

```bash
cd stack-contract

STACKS_NETWORK=testnet \
SENDER_ADDRESS=ST... \
SENDER_PRIVATE_KEY=your_key \
CONTRACT_PATH=contracts/vault.clar \
CONTRACT_NAME=vault \
npx ts-node deploy_stacks.ts
```

## Post-Deployment Configuration

### Update Backend Configuration

Update your backend with the deployed addresses:

**Ethereum contracts:**
```javascript
const TREASURY_ADDRESS = "0x...";
const ETH_DEPOSIT_GATEWAY_ADDRESS = "0x...";
```

**Stacks contracts:**
```javascript
const VAULT_CONTRACT = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault";
const SWAP_MANAGER_CONTRACT = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.swap-manager";
const STACKING_POOL_CONTRACT = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stacking-pool";
const REWARDS_LEDGER_CONTRACT = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.rewards-ledger";
```

### Update Frontend Configuration

Update your frontend environment variables:
```bash
VITE_TREASURY_ADDRESS=0x...
VITE_GATEWAY_ADDRESS=0x...
VITE_VAULT_CONTRACT=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault
# ... etc
```

## Troubleshooting

### Ethereum Deployment Issues

**Error: "Insufficient funds"**
- Ensure your deployer wallet has enough Base Sepolia ETH
- Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

**Error: "USDC_ADDRESS not set"**
- Make sure you've set the USDC_ADDRESS in your .env file
- Use Base Sepolia USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**Contract verification failed**
- This is optional and won't prevent deployment
- Verify manually on BaseScan if needed
- Requires BASESCAN_API_KEY in .env

### Stacks Deployment Issues

**Error: "Failed fetching account data"**
- Check your SENDER_ADDRESS is correct
- Ensure you're using a testnet address (starts with ST)
- Verify the Stacks API is accessible

**Error: "Insufficient funds"**
- Get testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Each contract deployment costs ~5000 microSTX

**Deployment stops mid-batch**
- Check the error message in the output
- Fix the issue and redeploy remaining contracts individually
- Use the single contract deployment method

**Nonce conflicts**
- The script automatically manages nonces
- Wait for previous transactions to confirm before redeploying
- Check transaction status on Stacks Explorer

## Security Considerations

### Production Deployment

When deploying to mainnet:

1. **Use a hardware wallet or secure key management**
   - Never commit private keys to version control
   - Use environment variables or secure vaults
   - Consider using a multisig for admin functions

2. **Audit contracts before deployment**
   - Have contracts professionally audited
   - Test thoroughly on testnet first
   - Verify all contract parameters

3. **Verify contracts on block explorers**
   - Always verify source code on BaseScan
   - Publish contract ABIs for transparency

4. **Set up monitoring**
   - Monitor contract events
   - Set up alerts for unusual activity
   - Track treasury balances

## Next Steps

After successful deployment:

1. ✅ Test deposit flow on Ethereum
2. ✅ Test bridging mechanism
3. ✅ Test staking on Stacks
4. ✅ Test reward claiming
5. ✅ Set up off-chain relayer
6. ✅ Configure frontend with contract addresses
7. ✅ Test end-to-end user flow

## Support

For issues or questions:
- Check contract addresses on block explorers
- Review transaction logs for errors
- Consult the main README.md for protocol details
- Open an issue on GitHub

---

**Last Updated**: January 2026
