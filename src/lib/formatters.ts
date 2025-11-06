/**
 * Formatting Utilities
 * 
 * Pure functions for converting between different units and formats.
 * No external dependencies - works anywhere (Node.js, browser, tests).
 * All functions are side-effect free and deterministic.
 */

import { STELLAR_CONVERSIONS } from '../constants';

/**
 * Format balance with 2 decimal places and locale-specific formatting
 * 
 * Converts string or number balance to US locale format with 2 decimals.
 * Returns '0.00' for invalid input (NaN, null, etc.)
 * 
 * @param balance - Balance as string or number
 * @returns Formatted balance string (e.g., "1,234.56")
 * 
 * @example
 * formatBalance("1234.5") // "1,234.50"
 * formatBalance(5) // "5.00"
 * formatBalance("invalid") // "0.00"
 */
export function formatBalance(balance: string | number): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;

  if (isNaN(num)) {
    return '0.00';
  }

  return num.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
}

/**
 * Convert USDC amount to stroops (Stellar's smallest unit)
 * 
 * Conversion factor: 1 USDC = 10,000,000 stroops
 * Uses Math.floor to ensure whole number
 * 
 * @param amount - Amount in USDC
 * @returns Amount in stroops
 * 
 * @example
 * usdcToStroops(5) // 50000000
 * usdcToStroops(0.01) // 100000
 */
export function usdcToStroops(amount: number): number {
  return Math.floor(amount * STELLAR_CONVERSIONS.STROOPS_PER_USDC);
}

/**
 * Convert stroops to USDC
 * 
 * Reverse of usdcToStroops.
 * Handles string, number, or bigint input.
 * 
 * @param stroops - Amount in stroops (string, number, or bigint)
 * @returns Amount in USDC
 * 
 * @example
 * stroopsToUsdc(50000000) // 5
 * stroopsToUsdc("100000") // 0.01
 * stroopsToUsdc(BigInt(50000000)) // 5
 */
export function stroopsToUsdc(stroops: string | number | bigint): number {
  return Number(stroops) / STELLAR_CONVERSIONS.STROOPS_PER_USDC;
}

/**
 * Truncate hash for display (e.g., in transaction lists)
 * 
 * Shows first N and last N characters with ellipsis in between.
 * Returns original string if too short to truncate.
 * 
 * @param hash - Full hash string to truncate
 * @param start - Number of characters to show from start (default 5)
 * @param end - Number of characters to show from end (default 5)
 * @returns Truncated hash string (e.g., "abc12....xyz89")
 * 
 * @example
 * truncateHash("abcdefghijklmnopqrstuvwxyz") // "abcde....vwxyz"
 * truncateHash("abc") // "abc" (unchanged - too short)
 */
export function truncateHash(hash: string, start = 5, end = 5): string {
  if (!hash || hash.length <= start + end) {
    return hash;
  }

  const prefix = hash.substring(0, start);
  const suffix = hash.substring(hash.length - end);

  return `${prefix}...${suffix}`;
}

/**
 * Format address for display (similar to hash truncation)
 * 
 * Uses truncateHash with 6 characters from start and end.
 * Optimized for Stellar addresses (56 characters).
 * 
 * @param address - Full Stellar address string
 * @returns Truncated address string (e.g., "GABCDE....XYZ123")
 * 
 * @example
 * truncateAddress("GBRPYHIL2CI6BLACP35IXGHUBAWTF4XKCQ3XWHZLGNIQFVWXGWRDOQW")
 * // "GBRPYH....RDOQW"
 */
export function truncateAddress(address: string): string {
  return truncateHash(address, 6, 4);
}
