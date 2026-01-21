Deploying Stack-Yield Contracts

This document describes how to deploy the Ethereum (`eth-contract`) and Stacks (`stack-contract`) smart contracts used by this project.

Ethereum (Base) — Foundry

The repository uses Foundry for Ethereum smart contract compilation and scripting.

1. Ensure Foundry is installed (`foundryup`) and `forge` is on your PATH.
2. Set environment variables and run the provided script:

```bash
# Example (replace with your values)
export BASE_RPC_URL="https://base-mainnet.rpc"    # Base RPC URL
export DEPLOYER_PRIVATE_KEY="0x..."               # Deployer private key
cd eth-contract
chmod +x deploy_base.sh
./deploy_base.sh
```

The script executes `forge build` then runs the Foundry script at `script/Counter.s.sol:CounterScript` and broadcasts transactions to the provided `BASE_RPC_URL` using the supplied private key.

If you have custom scripts, adjust `SCRIPT_FQN` environment variable, e.g.:

```bash
SCRIPT_FQN="script/MyDeploy.s.sol:MyDeploy" ./deploy_base.sh
```

Stacks — Clarinet (local) and remote deploy

Local testing with Clarinet

This repo contains a `Clarinet.toml` describing contracts. Clarinet will deploy the contracts to a local simulator automatically when running tests.

```bash
# install Clarinet (see Clarinet docs)
clarinet test
# or start a repl that has contracts loaded
clarinet console
```

Remote deploy (testnet/mainnet)

We include an example TypeScript script `deploy_stacks.ts` that demonstrates how to deploy a Clarity contract via the Stacks network API and `@stacks/transactions`.

Preconditions:
- Node 18+ and npm
- `SENDER_ADDRESS` and `SENDER_PRIVATE_KEY` environment variables
- `STACKS_NETWORK` = `testnet` or `mainnet` (defaults to `testnet`)
- `STACKS_API_URL` optional (defaults to Hiro public endpoints)

Install dependencies in the `stack-contract` folder (or globally for testing):

```bash
cd stack-contract
npm install @stacks/transactions @stacks/network node-fetch
npm i -D ts-node typescript

# Run deploy (example)
STACKS_NETWORK=testnet \
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co \
SENDER_ADDRESS=SP... \
SENDER_PRIVATE_KEY=your_private_key_here \
CONTRACT_PATH=contracts/vault.clar \
CONTRACT_NAME=vault \
npx ts-node deploy_stacks.ts
```

Notes:
- The script fetches the account nonce from the Stacks API before building the transaction.
- You can also publish contracts using a CI process or a deployer service that securely provides the private key.
- For production/mainnet use ensure you use a secure signer (HSM, KMS) instead of raw private keys.

If you'd like, I can:
- Add a small helper to auto-detect contract names and batch-deploy multiple contracts.
- Add mainnet verification or post-deploy registration steps.
