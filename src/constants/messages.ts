/**
 * User Feedback Messages
 * 
 * All user-facing text messages for toast notifications and status updates.
 * Centralized for easy maintenance and consistency.
 * Professional tone - no emojis.
 */

import { INITIAL_USDC_AMOUNT } from './wallet';

/**
 * Success messages for user feedback
 * Shown in toast notifications on successful operations
 */
export const SUCCESS_MESSAGES = {
  WALLET_CREATED: 'Wallet created successfully',
  WALLET_DISCONNECTED: 'Wallet disconnected',
  TIP_SENT_TEMPLATE: 'Tip of {amount} USDC sent successfully to {recipient}',
  WITHDRAWAL_SUCCESS_TEMPLATE: 'Withdrawal of {amount} USDC successful',
  ADDRESS_COPIED: 'Address copied to clipboard'
} as const;

/**
 * Error messages for user feedback
 * Shown in toast notifications when operations fail
 */
export const ERROR_MESSAGES = {
  WALLET_REQUIRED: 'Please create a wallet first',
  WALLET_CREATION_FAILED: 'Wallet creation failed',
  TIP_FAILED: 'Tip transaction failed',
  WITHDRAWAL_FAILED: 'Withdrawal failed',
  INSUFFICIENT_BALANCE_TEMPLATE: 'Insufficient USDC balance. You need at least {required} USDC',
  INSUFFICIENT_FEES: 'Insufficient transaction fees. You need more XLM for gas',
  TRUSTLINE_ERROR: 'USDC trustline not configured on your wallet',
  SELF_TIP_ERROR: 'You cannot tip yourself',
  INVALID_AMOUNT: 'Amount must be positive',
  ADMIN_ONLY: 'Only the admin can withdraw funds from the contract',
  NO_FUNDS_TO_WITHDRAW: 'No funds available to withdraw from the contract',
  ENV_VALIDATION_FAILED: 'Environment configuration validation failed',
  STELLAR_INIT_FAILED: 'Failed to initialize Stellar SDK connection'
} as const;

/**
 * Loading/processing messages for user feedback
 * Shown while async operations are in progress
 */
export const LOADING_MESSAGES = {
  CREATING_WALLET: 'Creating wallet',
  FUNDING_ACCOUNT: 'Funding account via Friendbot',
  SETTING_UP_TRUSTLINE: 'Setting up USDC trustline',
  SENDING_INITIAL_USDC: `Sending initial ${INITIAL_USDC_AMOUNT} USDC`,
  SENDING_TIP_TEMPLATE: 'Sending {amount} USDC tip to {recipient}',
  PROCESSING_WITHDRAWAL: 'Processing withdrawal',
  REFRESHING_BALANCE: 'Refreshing balance'
} as const;

/**
 * Application-level text (headers, titles, etc.)
 * Shown in main UI sections
 */
export const APP_TEXT = {
  TITLE: 'Stellar Soroban Tipping'
} as const;
