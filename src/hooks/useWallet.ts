/**
 * useWallet Hook
 * 
 * Manages wallet state and operations (create, disconnect, save to localStorage).
 * Handles localStorage persistence across page reloads.
 * Auto-loads wallet on mount if previously saved.
 * 
 * Usage:
 * ```
 * const { wallet, loading, createWalletAsync, disconnectWallet } = useWallet();
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { createWallet } from '../lib/wallet-service';
import { WALLET_STORAGE_KEY } from '../constants/hooks';
import type { Wallet, WalletCreationResult } from '../interfaces/wallet';

/**
 * Hook return type
 */
interface UseWalletReturn {
  /** Current wallet or null if not connected */
  wallet: Wallet | null;
  /** Whether wallet creation is in progress */
  loading: boolean;
  /** Async function to create new wallet */
  createWalletAsync: () => Promise<WalletCreationResult>;
  /** Function to disconnect current wallet */
  disconnectWallet: () => void;
}

/**
 * Manage wallet state with localStorage persistence
 * 
 * Features:
 * - Auto-loads wallet from localStorage on mount
 * - Saves new wallets to localStorage
 * - Removes wallet from localStorage on disconnect
 * 
 * @returns Wallet state and operations
 */
export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);

  // Load wallet from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setWallet(parsed);
      }
    } catch (error) {
      console.error('Failed to load wallet from localStorage:', error);
    }
  }, []);

  // Create new wallet
  const createWalletAsync = useCallback(async (): Promise<WalletCreationResult> => {
    setLoading(true);

    try {
      const result = await createWallet();

      if (result.success && result.publicKey && result.secretKey) {
        const newWallet: Wallet = {
          publicKey: result.publicKey,
          secretKey: result.secretKey
        };

        setWallet(newWallet);
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(newWallet));
      }

      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback((): void => {
    setWallet(null);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }, []);

  return {
    createWalletAsync,
    disconnectWallet,
    loading,
    wallet
  };
}
