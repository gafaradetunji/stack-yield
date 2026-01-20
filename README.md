# Stack Yield - Cross-Chain USDC Bridge & Staking Protocol

A hybrid Ethereum + Stacks blockchain protocol that enables users to bridge USDC from Ethereum to Stacks, stake it for yield, and earn rewards through automated stacking.

## Overview

**Stack Yield** facilitates:
- **USDC Bridging**: Transfer USDC from Ethereum to Stacks with a lightweight fee (0.2%)
- **Yield Generation**: Convert bridged USDC to STX and participate in Stacks staking
- **Reward Tracking**: Automatically track and claim staking rewards on Stacks
- **Cross-Chain Communication**: Seamless interaction between Ethereum and Stacks blockchains

## Architecture

### Ethereum Side (`eth-contract/`)
- **EthDepositGateway**: Entry point for USDC deposits and bridge orchestration
- **Treasury**: Fee collector and manager

### Stacks Side (`stacks-contract/stack-yield/`)
- **vault**: User USDC balance management on Stacks
- **stacking-pool**: STX staking tracker for Stacks protocol
- **rewards-ledger**: User reward balance and claim functionality
- **swap-manager**: USDCx ↔ STX conversion (DEX integration)

## Project Structure

```
stack-yield/
├── eth-contract/              # Ethereum Solidity contracts
│   ├── src/
│   │   ├── EthDepositGateway.sol
│   │   └── Treasury.sol
│   ├── test/
│   ├── script/
│   └── foundry.toml
├── stacks-contract/
│   └── stack-yield/           # Stacks Clarity contracts
│       ├── contracts/
│       │   ├── vault.clar
│       │   ├── stacking-pool.clar
│       │   ├── rewards-ledger.clar
│       │   └── swap-manager.clar
│       ├── tests/
│       ├── deployments/
│       └── Clarinet.toml
└── README.md
```

## Prerequisites

### For Ethereum Contracts
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (Forge/Cast)
- Solidity ^0.8.20
- Node.js v16+ (for scripts)

### For Stacks Contracts
- [Clarinet](https://github.com/hirosystems/clarinet) (Stacks smart contracts IDE)
- Node.js v16+
- npm or yarn

## Installation

### Clone and Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd stack-yield

# Install Ethereum dependencies
cd eth-contract
forge install

# Install Stacks dependencies
cd ../stacks-contract/stack-yield
npm install
```

## Running Locally

### Ethereum Contracts

```bash
cd eth-contract

# Build contracts
forge build

# Run tests
forge test

# Deploy locally (requires Anvil)
# Start Anvil in a separate terminal
anvil

# In another terminal, deploy
forge script script/Counter.s.sol:CounterScript --rpc-url http://localhost:8545 --private-key <YOUR_PRIVATE_KEY> --broadcast
```

### Stacks Contracts

```bash
cd stacks-contract/stack-yield

# Install dependencies
npm install

# Run tests
npm test

# Start local Stacks network
clarinet run

# Deploy to simnet
clarinet deployments apply
```

## Key Features

### User Deposit Flow (Ethereum)
1. User approves USDC to EthDepositGateway
2. Calls `deposit(amount, stacksAddress)` with desired amount and Stacks address
3. Deposit is recorded with unique ID and timestamp
4. 0.2% fee is held for later withdrawal

### Bridge Mechanism
- Off-chain relayer watches for deposits
- Once funds are bridged to Stacks, relayer calls `markDepositBridged()`
- User can then withdraw their USDC minus the fee

### Stacks Staking
- Bridged USDC (USDCx) is converted to STX via swap-manager
- STX is locked in the Stacks stacking pool
- Yields are credited to rewards-ledger
- Users claim rewards via `claim-reward`

## Configuration

### Environment Variables
Create `.env` files in respective directories:

```bash
# eth-contract/.env
PRIVATE_KEY=<your_private_key>
USDC_ADDRESS=<ethereum_usdc_address>
TREASURY_ADDRESS=<deployed_treasury>

# stacks-contract/stack-yield/.env
STACKS_NETWORK=simnet
ADMIN_WALLET=<admin_stacks_address>
```

### Network Configuration
- **Ethereum**: See `eth-contract/foundry.toml`
- **Stacks**: See `stacks-contract/stack-yield/Clarinet.toml` and `deployments/default.simnet-plan.yaml`

## Testing

```bash
# Ethereum tests
cd eth-contract
forge test -v

# View test coverage
forge coverage

# Stacks tests
cd stacks-contract/stack-yield
npm run test
```

## Contract Addresses (after deployment)

Addresses will be displayed during deployment. Update configuration files with deployed addresses for mainnet/testnet use.

## Security Considerations

- All contracts use access control (admin roles)
- ERC20 transfers are validated
- Deposit state machine prevents double-bridging/withdrawals
- Stacks contracts validate caller permissions

## Future Enhancements

- Real DEX integration (Alex, Arkadiko) instead of swap-manager mock
- Multi-asset bridge support
- Governance token for protocol fee adjustments
- Automated reward distribution
- Cross-chain messaging via Stacks Bitcoin finality

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

## License

MIT License - See individual LICENSE files in contract directories

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Last Updated**: January 2026
