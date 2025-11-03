/**
 * useStellar Hook
 * 
 * Initializes Stellar SDK connection on app startup.
 * Must be called once in App component before any blockchain operations.
 * Returns initialization status and any errors.
 * 
 * Usage:
 * ```
 * const { isInitialized, error } = useStellar();
 * if (error) showError(error);
 * ```
 */

import { useEffect, useState } from 'react';
import { ERROR_MESSAGES } from '../constants/messages';
import { initializeStellarSDK, isStellarInitialized } from '../lib/stellar-service';

/**
 * Hook return type
 */
interface UseStellarReturn {
  /** Whether Stellar SDK is initialized */
  isInitialized: boolean;
  /** Error message if initialization failed */
  error: string | null;
}

/**
 * Initialize Stellar SDK on component mount
 * 
 * Runs once per app lifecycle.
 * If initialization fails, stores error message.
 * 
 * @returns Initialization status and error message
 */
export function useStellar(): UseStellarReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initializeStellarSDK();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setIsInitialized(false);
    }
  }, []);

  return {
    error,
    isInitialized: isInitialized || isStellarInitialized()
  };
}
