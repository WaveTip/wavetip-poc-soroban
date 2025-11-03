/**
 * useTip Hook
 * 
 * Manages tip sending operations.
 * Handles loading state, error handling, and success feedback.
 * 
 * Usage:
 * ```
 * const { loading, sendTipAsync } = useTip(wallet);
 * const result = await sendTipAsync(5); // 5 USDC
 * ```
 */

import { useCallback, useState } from 'react';
import { sendTip } from '../lib/tip-service';
import type { TransactionResult, Wallet } from '../interfaces/wallet';

/**
 * Hook return type
 */
interface UseTipReturn {
  /** Whether tip is being sent */
  loading: boolean;
  /** Async function to send a tip */
  sendTipAsync: (amount: number) => Promise<TransactionResult>;
}

/**
 * Manage tip sending operations
 * 
 * @param wallet - User's wallet (null = will return error)
 * @returns Loading state and send function
 */
export function useTip(wallet: Wallet | null): UseTipReturn {
  const [loading, setLoading] = useState(false);

  const sendTipAsync = useCallback(
    async (amount: number): Promise<TransactionResult> => {
      if (!wallet) {
        return {
          error: 'Wallet not initialized',
          success: false
        };
      }

      setLoading(true);
      try {
        const result = await sendTip(wallet, amount);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [wallet]
  );

  return {
    loading,
    sendTipAsync
  };
}
