/**
 * useToast Hook
 * 
 * Manages toast notification state and timing.
 * Auto-dismisses after specified duration.
 * Provides methods to show and close toasts.
 * 
 * Usage:
 * ```
 * const { toast, showToast, closeToast } = useToast();
 * showToast('Success!', 'success');
 * ```
 */

import { useCallback, useState } from 'react';
import { TOAST_AUTO_DISMISS_DURATION_MS } from '../constants/hooks';
import type { ToastNotification } from '../interfaces/wallet';

/**
 * Hook return type
 */
interface UseToastReturn {
  /** Current toast or null if not displayed */
  closeToast: () => void;
  /** Function to show toast */
  showToast: (message: string, type?: ToastNotification['type'], persistent?: boolean) => void;
  /** Current toast data or null */
  toast: ToastNotification | null;
}

/**
 * Manage toast notification state
 * 
 * Features:
 * - Shows toast with message and type (success, error, warning, info)
 * - Auto-dismisses after specified duration (default 3 seconds)
 * - Can be manually closed via closeToast()
 * - Only one toast visible at a time
 * 
 * @param duration - Auto-dismiss duration in milliseconds (default 3000)
 * @returns Toast state and functions
 */
export function useToast(duration: number = TOAST_AUTO_DISMISS_DURATION_MS): UseToastReturn {
  const [toast, setToast] = useState<ToastNotification | null>(null);

  /**
   * Show a toast notification
   * Auto-dismisses after specified duration
   */
  const showToast = useCallback(
    (message: string, type: ToastNotification['type'] = 'info', persistent: boolean = false): void => {
      setToast({
        message,
        show: true,
        type,
        persistent
      });

      if (!persistent) {
      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, show: false } : null));
      }, duration);
      void timer; // Silence unused variable warning
      }
    },
    [duration]
  );

  /**
   * Close toast immediately
   */
  const closeToast = useCallback((): void => {
    setToast(null);
  }, []);

  return {
    closeToast,
    showToast,
    toast
  };
}
