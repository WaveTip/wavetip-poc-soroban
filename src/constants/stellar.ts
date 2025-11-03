/**
 * Stellar Network Configuration Constants
 * 
 * Configuration for Stellar SDK, network settings, and blockchain parameters.
 * All environment variables loaded here - single source of truth for Stellar config.
 */

/**
 * Stellar network and RPC configuration
 * Loaded from environment variables with sensible defaults
 */
export const STELLAR_CONFIG = {
    // Network
    NETWORK: (import.meta.env.VITE_NETWORK || 'testnet').toLowerCase(),
    HORIZON_URL: import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    SOROBAN_RPC_URL: import.meta.env.VITE_SOROBAN_RPC_URL,
  
    // Contracts
    TIP_CONTRACT_ID: import.meta.env.VITE_TIP_CONTRACT_ID,
    USDC_CONTRACT_ID: import.meta.env.VITE_USDC_CONTRACT_ID,
  
    // Accounts
    RECIPIENT_ADDRESS: import.meta.env.VITE_RECIPIENT_ADDRESS,
    RECIPIENT_NAME: import.meta.env.VITE_RECIPIENT_NAME || 'Streamer',
    TWITCH_CHANNEL: (import.meta.env.VITE_TWITCH_CHANNEL || 'channel').toLowerCase(),
    BOB_SECRET_KEY: import.meta.env.VITE_BOB_SECRET_KEY,
  
    // Streamer Profile Picture URL (from Twitch CDN)
    PROFILE_PICTURE_URL: import.meta.env.VITE_PROFILE_PICTURE_URL || '',
  
    // Assets
    USDC_ISSUER: import.meta.env.VITE_USDC_ISSUER,
    USDC_CODE: 'USDC'
  } as const;
  
  /**
   * Stellar conversion rates and fees
   * All numeric constants for blockchain operations
   */
  export const STELLAR_CONVERSIONS = {
    STROOPS_PER_USDC: 10_000_000,
    BASE_FEE: 100,
    TESTNET_FRIENDBOT_URL: 'https://friendbot.stellar.org'
  } as const;
  
  /**
   * Stellar network passphrases
   * Used for transaction signing and network identification
   */
  export const STELLAR_NETWORK = {
    TESTNET_PASSPHRASE: 'Test SDF Network ; September 2015',
    MAINNET_PASSPHRASE: 'Public Global Stellar Network ; September 2015'
  } as const;
  
  /**
   * Validate required environment variables on app startup
   * 
   * Checks that all critical Stellar configuration is provided.
   * Logs errors to console if any required variables are missing.
   * 
   * @throws Does not throw - logs to console instead for app startup resilience
   */
  export function validateStellarConfig(): void {
    const required = [
      'VITE_RECIPIENT_NAME',
      'VITE_TWITCH_CHANNEL',
      'VITE_NETWORK',
      'VITE_HORIZON_URL',
      'VITE_SOROBAN_RPC_URL',
      'VITE_TIP_CONTRACT_ID',
      'VITE_USDC_CONTRACT_ID',
      'VITE_RECIPIENT_ADDRESS',
      'VITE_USDC_ISSUER'
    ] as const;
  
    const missing = required.filter((key) => !import.meta.env[key]);
  
    if (missing.length > 0) {
      console.error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
          `Please check your .env file.`
      );
    }
  }
  