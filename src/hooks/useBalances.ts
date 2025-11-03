/**
 * useBalances Hook
 * 
 * Manages balance fetching and polling.
 * Automatically refreshes balances at regular intervals from blockchain.
 * Fetches recipient and contract balances even without user wallet.
 * Silent background polling - no loading spinner shown.
 * 
 * Usage:
 * ```
 * const { balances, refresh } = useBalances(wallet);
 * // Auto-polls every 3 seconds
 * // Manual refresh: await refresh();
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { refreshAllBalances } from '../lib/balance-service';
import { BALANCE_POLL_INTERVAL_MS } from '../constants/hooks';
import type { BalanceData, Wallet } from '../interfaces/wallet';

/**
 * Default balance state when not yet loaded
 */
const DEFAULT_BALANCES: BalanceData = {
  contract: '0',
  recipient: '0',
  user: '0'
};

/**
 * Hook return type
 */
interface UseBalancesReturn {
  /** Current balances for user, recipient, and contract */
  balances: BalanceData;
  /** Manual refresh function */
  refresh: () => Promise<void>;
}

/**
 * Manage balance state with automatic polling
 * 
 * Features:
 * - Fetches all balances on mount
 * - Polls every 3 seconds in background
 * - Works even without wallet (shows recipient/contract balances)
 * - No loading spinner - silent updates
 * 
 * @param wallet - Current wallet (optional - can be null)
 * @returns Balances and manual refresh function
 */
export function useBalances(wallet: Wallet | null): UseBalancesReturn {
  const [balances, setBalances] = useState<BalanceData>(DEFAULT_BALANCES);

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    try {
      const walletAddress = wallet?.publicKey || '';
      const updated = await refreshAllBalances(walletAddress);
      setBalances(updated);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  }, [wallet]);

  // Auto-polling - silent background updates
  useEffect(() => {
    // Initial refresh on mount
    refresh();

    // Setup polling interval
    const interval = setInterval(() => {
      refresh();
    }, BALANCE_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [wallet, refresh]);

  return {
    balances,
    refresh
  };
}
