# Quick Start - Deployment Scripts

## Ethereum Deployment (Base Sepolia)

```bash
cd eth-contract

# Configure
cp .env.example .env
# Edit .env with your private key and settings

# Deploy
./deploy_base.sh
```

**Deploys:**
- Treasury.sol
- EthDepositGateway.sol

---

## Stacks Deployment (Testnet)

```bash
cd stack-contract

# Configure
cp .env.example .env
# Edit .env with your Stacks address and private key

# Deploy all contracts
./deploy_all_stacks.sh
```

**Deploys (in order):**
1. vault.clar
2. swap-manager.clar
3. stacking-pool.clar
4. rewards-ledger.clar

---

## Important Addresses

### Base Sepolia
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **RPC**: `https://sepolia.base.org`
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Stacks Testnet
- **API**: `https://stacks-node-api.testnet.stacks.co`
- **Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet

---

## Full Documentation

See [DEPLOYMENT.md](file:///home/gafar/solidity-practice/new-stacks-yield/DEPLOYMENT.md) for complete deployment guide with troubleshooting and security considerations.
