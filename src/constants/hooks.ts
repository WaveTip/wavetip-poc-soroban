/**
 * Hooks Configuration Constants
 * 
 * All magic numbers and default values used in custom hooks.
 */

/**
 * Balance polling interval in milliseconds
 * How often to refresh balances from blockchain
 */
export const BALANCE_POLL_INTERVAL_MS = 3000;

/**
 * Default toast notification duration in milliseconds
 * How long to show toast before auto-dismiss
 */
export const TOAST_AUTO_DISMISS_DURATION_MS = 3000;

/**
 * LocalStorage key for wallet persistence
 * Used to save/load wallet across page reloads
 */
export const WALLET_STORAGE_KEY = 'soroban_wallet';
