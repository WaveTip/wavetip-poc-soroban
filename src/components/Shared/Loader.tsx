/**
 * Loading Spinner Component
 * 
 * Fullscreen overlay with centered spinner animation.
 * Displayed while processing async operations (wallet creation, tips, withdrawals).
 * 
 * No props required - uses only CSS constants for styling.
 */

import { LOADER_CLASSES } from '../../constants/ui';

/**
 * Loading spinner component
 * Renders fullscreen overlay with spinner
 */
export function Loader(): JSX.Element {
  return (
    <div className={LOADER_CLASSES.LOADER_OVERLAY}>
      <div className={LOADER_CLASSES.SPINNER} />
    </div>
  );
}
