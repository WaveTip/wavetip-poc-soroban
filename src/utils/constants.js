// Stellar Constants
export const STROOPS_PER_USDC = 10_000_000
export const BASE_FEE = 100 // Stellar base fee in stroops

// Configuration - All from environment variables
export const RECIPIENT_NAME = import.meta.env.VITE_RECIPIENT_NAME
// Twitch channel is automatically derived from recipient name (lowercase)
export const TWITCH_CHANNEL = RECIPIENT_NAME ? RECIPIENT_NAME.toLowerCase() : ''
export const NETWORK = import.meta.env.VITE_NETWORK
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL
export const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL
export const TIP_CONTRACT_ID = import.meta.env.VITE_TIP_CONTRACT_ID
export const USDC_CONTRACT_ID = import.meta.env.VITE_USDC_CONTRACT_ID
export const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_ADDRESS
export const BOB_SECRET_KEY = import.meta.env.VITE_BOB_SECRET_KEY
export const USDC_ISSUER = import.meta.env.VITE_USDC_ISSUER

// Validate required environment variables
export const validateEnv = () => {
  const required = [
    'VITE_RECIPIENT_NAME',
    'VITE_NETWORK',
    'VITE_HORIZON_URL',
    'VITE_SOROBAN_RPC_URL',
    'VITE_TIP_CONTRACT_ID',
    'VITE_USDC_CONTRACT_ID',
    'VITE_RECIPIENT_ADDRESS',
    'VITE_USDC_ISSUER'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file.`
    )
  }
}

