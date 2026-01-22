# Base Sepolia Deployment Summary

**Deployment Date:** January 22, 2026
**Network:** Base Sepolia Testnet
**Deployer Address:** 0x8B7b33394d0592CBb623CBE31D5Fe87CF5cDb141

---

## Deployed Contracts

### MockUSDC (Test Token)
- **Address:** `0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b`
- **Explorer:** https://sepolia.basescan.org/address/0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b
- **Verification:** ✅ Verified on Sourcify
- **Initial Supply:** 1,000,000 USDC minted to deployer
- **Features:**
  - Anyone can mint via `faucet()` (1000 USDC)
  - Custom minting via `mintToSelf(amount)`
  - Admin minting via `mint(address, amount)`

### Treasury
- **Address:** `0xad444cfdff8687009b4d0ba8f9368ecf7ce3b454`
- **Explorer:** https://sepolia.basescan.org/address/0xad444cfdff8687009b4d0ba8f9368ecf7ce3b454
- **Verification:** ✅ Verified on Sourcify
- **Purpose:** Fee collector and manager for the protocol
- **Admin:** 0x8B7b33394d0592CBb623CBE31D5Fe87CF5cDb141

### EthDepositGateway
- **Address:** `0x920b0e521c5e553007578f2518f93a942f9386a9`
- **Explorer:** https://sepolia.basescan.org/address/0x920b0e521c5e553007578f2518f93a942f9386a9
- **Verification:** ✅ Verified on Sourcify
- **Purpose:** Entry point for USDC deposits and bridge orchestration
- **Fee:** 0.2% (20 basis points)
- **Connected USDC:** 0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b
- **Connected Treasury:** 0xad444cfdff8687009b4d0ba8f9368ecf7ce3b454

---

## Configuration for Frontend/Backend

```javascript
// Base Sepolia Configuration
const NETWORK = {
  chainId: 84532,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org"
};

const CONTRACTS = {
  USDC: "0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b",
  Treasury: "0xad444cfdff8687009b4d0ba8f9368ecf7ce3b454",
  EthDepositGateway: "0x920b0e521c5e553007578f2518f93a942f9386a9"
};
```

---

## Testing the Deployment

### 1. Get Test USDC

Users can mint test USDC by calling the faucet function:

```javascript
// Using ethers.js
const mockUSDC = new ethers.Contract(
  "0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b",
  ["function faucet()"],
  signer
);
await mockUSDC.faucet(); // Mints 1000 USDC
```

Or via cast:
```bash
cast send 0x6f15582cEDb7A5aB53B90fE7B367c219e4598f0b \
  "faucet()" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### 2. Test Deposit Flow

```javascript
// 1. Approve USDC to gateway
await usdc.approve(
  "0x920b0e521c5e553007578f2518f93a942f9386a9",
  amount
);

// 2. Deposit to gateway
await gateway.deposit(
  amount,
  stacksAddressBytes // Your Stacks address as bytes
);
```

---

## Next Steps

1. ✅ **Ethereum contracts deployed**
2. ⏳ **Deploy Stacks contracts to testnet**
3. ⏳ **Set up off-chain relayer**
4. ⏳ **Configure frontend with contract addresses**
5. ⏳ **Test end-to-end flow**

---

## Important Notes

- This is a **TESTNET** deployment for testing purposes only
- MockUSDC allows unlimited minting for testing
- Keep these addresses for your configuration files
- Treasury admin can withdraw collected fees
- EthDepositGateway charges 0.2% fee on deposits

---

**Deployment Transaction Hashes:**
- MockUSDC: Check broadcast/DeployMockUSDC.s.sol/84532/run-latest.json
- Treasury & Gateway: Check broadcast/DeployBase.s.sol/84532/run-latest.json
