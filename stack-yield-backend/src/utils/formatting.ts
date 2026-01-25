import { ethers } from 'ethers';

/**
 * Formats a BigInt value (atoms) to a human-readable USDC string (6 decimals)
 */
export function formatUSDC(value: bigint | string | number): string {
    return ethers.formatUnits(value.toString(), 6);
}

/**
 * Parses a human-readable USDC string (e.g., "10.5") to BigInt atoms (6 decimals)
 */
export function parseUSDC(value: string): bigint {
    return ethers.parseUnits(value, 6);
}

/**
 * Common formatting utility for API responses
 */
export function formatQuantity(value: bigint | string | number, decimals: number = 6): string {
    return ethers.formatUnits(value.toString(), decimals);
}
