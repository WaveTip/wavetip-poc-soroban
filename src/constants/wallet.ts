/**
 * Wallet Configuration Constants
 * 
 * All magic numbers and configuration for wallet operations.
 */

/**
 * Initial USDC amount sent to new wallets (Bob's gift)
 */
export const INITIAL_USDC_AMOUNT = '5';

/**
 * Delay after Friendbot funding before setting up trustline (milliseconds)
 * Allows time for account to be created on blockchain
 */
export const FRIENDBOT_ACCOUNT_CREATION_DELAY_MS = 3000;

/**
 * Friendbot API request timeout (milliseconds)
 */
export const FRIENDBOT_REQUEST_TIMEOUT_MS = 10000;
