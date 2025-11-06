/**
 * Stellar SDK Service
 * 
 * Initializes and manages Stellar SDK connections.
 * Provides singleton instances for Horizon and Soroban RPC servers.
 * Zero React dependencies - can run in Node.js.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, STELLAR_NETWORK } from '../constants';

/**
 * Singleton instances
 */
let horizonServer: StellarSdk.Horizon.Server | null = null;
let sorobanServer: StellarSdk.SorobanRpc.Server | null = null;
let isInitialized = false;

/**
 * Initialize Stellar SDK connections
 * Validates configuration and creates singleton instances
 * 
 * @throws Error if URLs are missing or initialization fails
 */
export function initializeStellarSDK(): void {
  if (isInitialized) {
    return;
  }

  try {
    // Validate required URLs
    if (!STELLAR_CONFIG.HORIZON_URL || !STELLAR_CONFIG.SOROBAN_RPC_URL) {
      throw new Error('Horizon and Soroban RPC URLs are required');
    }

    horizonServer = new StellarSdk.Horizon.Server(STELLAR_CONFIG.HORIZON_URL);
    sorobanServer = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.SOROBAN_RPC_URL);
    isInitialized = true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize Stellar SDK: ${message}`);
  }
}

/**
 * Get Horizon server instance for account operations
 * 
 * @returns Horizon server
 * @throws Error if SDK not initialized
 */
export function getHorizonServer(): StellarSdk.Horizon.Server {
  if (!horizonServer) {
    throw new Error('Stellar SDK not initialized. Call initializeStellarSDK() first.');
  }
  return horizonServer;
}

/**
 * Get Soroban RPC server instance for contract operations
 * 
 * @returns Soroban RPC server
 * @throws Error if SDK not initialized
 */
export function getSorobanServer(): StellarSdk.SorobanRpc.Server {
  if (!sorobanServer) {
    throw new Error('Stellar SDK not initialized. Call initializeStellarSDK() first.');
  }
  return sorobanServer;
}

/**
 * Get network passphrase for transaction signing
 * Currently hardcoded to testnet
 * 
 * @returns Network passphrase constant
 * @todo Support mainnet switching
 */
export function getNetworkPassphrase(): string {
  return STELLAR_NETWORK.TESTNET_PASSPHRASE;
}

/**
 * Check if SDK is initialized
 * 
 * @returns True if initialized, false otherwise
 */
export function isStellarInitialized(): boolean {
  return isInitialized;
}
