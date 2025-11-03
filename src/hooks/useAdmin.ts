/**
 * useAdmin Hook
 * 
 * Manages admin withdrawal operations from contract.
 * Handles loading state and error handling for fee withdrawals.
 * Only admin wallet can successfully withdraw - others get error.
 * 
 * Usage:
 * ```
 * const { loading, withdrawAsync } = useAdmin(wallet);
 * const result = await withdrawAsync();
 * ```
 */

import { useCallback, useState } from 'react';
import { withdrawFees } from '../lib/tip-service';
import { ERROR_MESSAGES } from '../constants/messages';
import type { TransactionResult, Wallet } from '../interfaces/wallet';

/**
 * Hook return type
 */
interface UseAdminReturn {
  /** Whether withdrawal is in progress */
  loading: boolean;
  /** Async function to execute withdrawal */
  withdrawAsync: () => Promise<TransactionResult>;
}

/**
 * Manage admin withdrawal operations
 * 
 * Executes fee withdrawal from contract to admin wallet.
 * Sets loading state during operation.
 * 
 * @param wallet - Admin wallet (null = will return error)
 * @returns Loading state and withdraw function
 */
export function useAdmin(wallet: Wallet | null): UseAdminReturn {
  const [loading, setLoading] = useState(false);

  const withdrawAsync = useCallback(async (): Promise<TransactionResult> => {
    if (!wallet) {
      return {
        success: false,
        error: ERROR_MESSAGES.WALLET_REQUIRED
      };
    }

    setLoading(true);
    try {
      const result = await withdrawFees(wallet);
      return result;
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  return {
    loading,
    withdrawAsync
  };
}
