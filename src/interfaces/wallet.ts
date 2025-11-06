/**
 * Wallet and Transaction TypeScript Interfaces
 * 
 * Shared type definitions for wallet operations, balances, and blockchain data.
 * Central source of truth for all application data structures.
 * All interfaces are exported and used throughout the app.
 */

/**
 * Wallet keypair structure
 * Represents a Stellar account with public and secret keys
 * 
 * @property publicKey - Stellar account public key (G...)
 * @property secretKey - Stellar account secret key (S...) - NEVER expose this
 */
export interface Wallet {
    publicKey: string;
    secretKey: string;
  }
  
  /**
   * Balance data for all three account types
   * Updated periodically from blockchain via balance service
   * 
   * @property user - User's personal wallet balance
   * @property recipient - Streamer/recipient wallet balance
   * @property contract - Smart contract accumulated fees balance
   */
  export interface BalanceData {
    contract: string;
    recipient: string;
    user: string;
  }
  
  /**
   * Result of wallet creation operation
   * Contains success status, keys, and creation messages
   * 
   * @property success - Whether wallet was successfully created
   * @property publicKey - New wallet public key (if success)
   * @property secretKey - New wallet secret key (if success)
   * @property error - Error message (if failed)
   * @property messages - Array of operation steps performed
   */
  export interface WalletCreationResult {
    error?: string;
    messages: string[];
    publicKey?: string;
    secretKey?: string;
    success: boolean;
  }
  
  /**
   * Generic transaction result for blockchain operations
   * Used for tips, withdrawals, and other contract calls
   * 
   * @property success - Whether transaction succeeded
   * @property txHash - Transaction hash (if successful)
   * @property error - Error message (if failed)
   * @property message - Additional message or feedback
   */
  export interface TransactionResult {
    error?: string;
    message?: string;
    success: boolean;
    txHash?: string;
  }
  
  /**
   * Toast notification state
   * Manages a single temporary notification message
   * 
   * @property message - Text to display
   * @property type - Notification type (success, error, warning, info)
   * @property show - Whether to display the toast
   */
  export interface ToastNotification {
    message: string;
    show: boolean;
    type: 'error' | 'info' | 'success' | 'warning';
  /** If true, do not auto-dismiss; stays until close */
  persistent?: boolean;
  }
  