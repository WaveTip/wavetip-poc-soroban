/**
 * UI Constants
 * 
 * CSS class names, display strings, and UI-related constants.
 * Centralized for consistency across components.
 * All styling references should use these constants - no hardcoded strings.
 */

import { TIP_RECIPIENT_PERCENTAGE, TIP_CONTRACT_FEE_PERCENTAGE } from './tip';

/**
 * UI label text
 * User-facing strings in components
 */
export const UI_LABELS = {
  // Wallet section
  WALLET_TITLE: 'Your Wallet',
  CREATE_WALLET: 'Create Wallet',
  CREATING_WALLET: 'Creating...',
  DISCONNECT_WALLET: 'Disconnect Wallet',
  COPY_ADDRESS: 'Copy',
  ADDRESS_LABEL: 'Address',
  BALANCE_LABEL: 'USDC Balance',

  // Tip section
  TIP_TITLE: 'Send a Tip',
  SEND_TIP: 'Send',
    CUSTOM_AMOUNT_PLACEHOLDER: 'Custom amount',

  // Admin section
  ADMIN_TITLE: 'Admin',
  ADMIN_DESCRIPTION: 'Only the admin can withdraw accumulated fees from the contract',
  WITHDRAW_FEES: 'Withdraw Fees',

  // Balance cards
  RECIPIENT_LABEL_TEMPLATE: '{name}',
  RECIPIENT_HINT: `${TIP_RECIPIENT_PERCENTAGE}% of tips received`,
  CONTRACT_LABEL: 'Contract Fees',
  CONTRACT_HINT: `${TIP_CONTRACT_FEE_PERCENTAGE}% fees accumulated`,

  // Contract info
  CONTRACT_INFO_TITLE: 'Soroban Contract Information',
  CONTRACT_ID_LABEL: 'Contract ID',
  RECIPIENT_ADDRESS_LABEL_TEMPLATE: '{name} Address',
  NETWORK_LABEL: 'Network',

  // Stream
  STREAM_TITLE: 'Live Stream',
  CHAT_TITLE: 'Live Chat'
} as const;

/**
 * CSS class names for layout
 */
export const LAYOUT_CLASSES = {
  APP: 'app',
  CONTAINER: 'container',
  GRID_LAYOUT: 'grid-layout',
  HEADER: 'app-header'
} as const;

/**
 * CSS class names for cards
 */
export const CARD_CLASSES = {
  CARD: 'card',
  BALANCE_CARD: 'balance-card',
  STAT_CARD: 'stat-card',
  STREAM_GRID: 'stream-grid'
} as const;

/**
 * CSS class names for buttons
 */
export const BUTTON_CLASSES = {
  BTN: 'btn',
  BTN_PRIMARY: 'btn-primary',
  BTN_SECONDARY: 'btn-secondary',
  BTN_TIP: 'btn-tip',
  BTN_ADMIN: 'btn-admin',
  BTN_LOGOUT: 'btn-logout',
  BTN_SMALL: 'btn-small',
  BTN_ACTIVE: 'active'
} as const;

/**
 * CSS class names for forms and inputs
 */
export const FORM_CLASSES = {
  INPUT: 'input',
  INPUT_CUSTOM: 'input-custom',
  FORM_GROUP: 'form-group',
  LABEL: 'label'
} as const;

/**
 * CSS class names for messages
 */
export const MESSAGE_CLASSES = {
  MESSAGE: 'message',
  MESSAGE_SUCCESS: 'message-success',
  MESSAGE_ERROR: 'message-error',
  MESSAGE_INFO: 'message-info'
} as const;

/**
 * CSS class names for sections
 */
export const SECTION_CLASSES = {
  WALLET_INFO: 'wallet-info',
  TIP_BUTTONS: 'tip-buttons',
  CUSTOM_TIP: 'custom-tip',
  STATS_GRID: 'stats-grid',
  TIPS_SECTION: 'tips-section',
  CONTRACT_INFO: 'contract-info'
} as const;

/**
 * CSS class names for notifications/toasts
 */
export const NOTIFICATION_CLASSES = {
  TOAST: 'toast',
  TOAST_SHOW: 'show',
  TOAST_SUCCESS: 'success',
  TOAST_ERROR: 'error',
  TOAST_WARNING: 'warning',
  TOAST_INFO: 'info'
} as const;

/**
 * CSS class names for loaders
 */
export const LOADER_CLASSES = {
  LOADER_OVERLAY: 'loader-overlay',
  SPINNER: 'spinner'
} as const;
