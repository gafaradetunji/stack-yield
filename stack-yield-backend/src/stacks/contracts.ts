export const STACKING_POOL_CONTRACT = {
  address: process.env.STACKING_POOL_ADDRESS || '',
  name: 'StackingPool',
};

export const SWAP_MANAGER_CONTRACT = {
  address: process.env.SWAP_MANAGER_ADDRESS || '',
  name: 'SwapManager',
};

export const REWARDS_LEDGER_CONTRACT = {
  address: process.env.REWARDS_LEDGER_ADDRESS || '',
  name: 'RewardsLedger',
};

export const VAULT_CONTRACT = {
  address: process.env.VAULT_ADDRESS || '',
  name: 'Vault',
};

export const contracts = {
  stackingPool: STACKING_POOL_CONTRACT,
  swapManager: SWAP_MANAGER_CONTRACT,
  rewardsLedger: REWARDS_LEDGER_CONTRACT,
  vault: VAULT_CONTRACT,
};

export default contracts;
