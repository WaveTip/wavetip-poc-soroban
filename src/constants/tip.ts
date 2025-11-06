/**
 * Tip Configuration Constants
 * 
 * All magic strings and numbers related to tipping functionality.
 */

/**
 * Preset tip amounts in USDC
 * Users can quickly select these amounts
 */
export const PRESET_TIP_AMOUNTS = [1, 2, 5] as const;

/**
 * Recipient's share percentage of tips
 */
export const TIP_RECIPIENT_PERCENTAGE = 99;

/**
 * Contract fee percentage
 */
export const TIP_CONTRACT_FEE_PERCENTAGE = 1;

/**
 * Fee distribution description for UI
 */
export const TIP_FEE_DESCRIPTION = `${TIP_RECIPIENT_PERCENTAGE}% of the amount sent, ${TIP_CONTRACT_FEE_PERCENTAGE}% fee is kept by the contract.`;

/**
 * Minimum custom tip amount in USDC
 */
export const CUSTOM_TIP_MIN = 0.01;

/**
 * Custom tip input step in USDC
 */
export const CUSTOM_TIP_STEP = 0.01;
