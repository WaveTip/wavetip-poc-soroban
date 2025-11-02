import { STROOPS_PER_USDC } from './constants'

// Format balance with 2 decimal places
export const formatBalance = (balance) => {
  return parseFloat(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Convert USDC amount to stroops
export const usdcToStroops = (amount) => {
  return Math.floor(amount * STROOPS_PER_USDC)
}

// Convert stroops to USDC
export const stroopsToUsdc = (stroops) => {
  return Number(stroops) / STROOPS_PER_USDC
}

// Truncate transaction hash for display
export const truncateHash = (hash, start = 5, end = 5) => {
  if (!hash || hash.length <= start + end) return hash
  return `${hash.substring(0, start)}....${hash.substring(hash.length - end)}`
}

