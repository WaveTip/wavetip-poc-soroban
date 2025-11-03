/**
 * Toast Notification Component
 * 
 * Displays temporary feedback messages to users.
 * Supports success, error, warning, and info types with icons.
 * Auto-dismiss handled by parent useToast hook.
 */

import React, { useEffect, useState } from 'react';
import { NOTIFICATION_CLASSES } from '../../constants/ui';
import type { ToastNotification } from '../../interfaces/wallet';

/**
 * Component props
 */
interface ToastProps {
  toast: ToastNotification | null;
  onClose: () => void;
}

/**
 * SVG icons for each toast type
 * Inline for bundle efficiency - no external icon library needed
 */
const TOAST_ICONS: Record<ToastNotification['type'], React.ReactElement> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
};

/**
 * Get CSS class name for toast type
 * 
 * @param type - Toast type (success, error, warning, info)
 * @returns CSS class name
 */
function getToastTypeClass(type: ToastNotification['type']): string {
  const classMap: Record<ToastNotification['type'], string> = {
    success: NOTIFICATION_CLASSES.TOAST_SUCCESS,
    error: NOTIFICATION_CLASSES.TOAST_ERROR,
    warning: NOTIFICATION_CLASSES.TOAST_WARNING,
    info: NOTIFICATION_CLASSES.TOAST_INFO
  };
  return classMap[type];
}

/**
 * Toast notification component
 * 
 * Renders a toast message with icon and type-specific styling.
 * Returns null when toast is not visible.
 * 
 * @param toast - Toast data (null or show=false = not displayed)
 * @param onClose - Callback to close toast (unused - for future interactivity)
 * @returns Toast element or null if not visible
 */
export function Toast({ toast, onClose }: ToastProps): JSX.Element | null {
  if (!toast) {
    return null;
  }

  const typeClass = getToastTypeClass(toast.type);
  const [isShown, setIsShown] = useState(false);

  // Smooth entrance: apply show class on next tick when toast appears
  useEffect(() => {
    if (toast.show) {
      const id = requestAnimationFrame(() => setIsShown(true));
      return () => cancelAnimationFrame(id);
    }
    setIsShown(false);
  }, [toast.show]);

  const showClass = isShown ? NOTIFICATION_CLASSES.TOAST_SHOW : '';

  return (
    <div
      className={`${NOTIFICATION_CLASSES.TOAST} ${typeClass} ${showClass}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      onTransitionEnd={() => {
        if (!toast.show) {
          onClose();
        }
      }}
    >
      <div className="toast-icon" aria-hidden="true">
        {TOAST_ICONS[toast.type]}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        aria-label="Close notification"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}
