/**
 * Transaction Configuration Constants
 * 
 * Timeouts and polling intervals for blockchain operations.
 */

/**
 * Transaction timeout in seconds (for TransactionBuilder)
 */
export const TRANSACTION_TIMEOUT_SECONDS = 30;

/**
 * Poll interval while waiting for transaction confirmation (milliseconds)
 */
export const TRANSACTION_POLL_INTERVAL_MS = 1000;

/**
 * Maximum time to wait for transaction confirmation (milliseconds)
 */
export const TRANSACTION_CONFIRMATION_TIMEOUT_MS = 30000;

/**
 * Stellar null account address (used for read-only contract simulations)
 */
export const STELLAR_NULL_ACCOUNT = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

/**
 * Contract address detection: contracts start with 'C'
 */
export const CONTRACT_ADDRESS_PREFIX = 'C';
