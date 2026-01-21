export interface Chain {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

export const ETHEREUM: Chain = {
  id: 1,
  name: 'Ethereum',
  rpcUrl: process.env.ETH_RPC_URL || '',
  explorerUrl: 'https://etherscan.io',
};

export const SEPOLIA: Chain = {
  id: 11155111,
  name: 'Sepolia',
  rpcUrl: process.env.ETH_RPC_URL || '',
  explorerUrl: 'https://sepolia.etherscan.io',
};

export const STACKS: Chain = {
  id: 5050,
  name: 'Stacks',
  rpcUrl: process.env.STACKS_RPC_URL || '',
  explorerUrl: 'https://explorer.stacks.co',
};

export const chains = {
  ethereum: ETHEREUM,
  sepolia: SEPOLIA,
  stacks: STACKS,
};

export default chains;
