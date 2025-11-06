/**
 * Banner Component
 * 
 * Thin dismissible banner with primary color background.
 * Can be closed with X button.
 * Uses state to manage visibility.
 */

import { useState } from 'react';
import { APP_TEXT } from '../constants/messages';

/**
 * Promotional banner component
 * 
 * @returns Banner element or null if dismissed
 */
export function Banner(): JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="banner">
      <div className="banner__content">
        <div className="banner__logos" aria-label="WaveTip and Stellar partnership">
          <img
            src="/stellar-horizontal.svg"
            alt="Stellar"
            className="banner__logo banner__logo--stellar"
            height={24}
          />
          <span className="banner__divider" aria-hidden>
            ×
          </span>
          <img
            src="/wavetip-horizontal.svg"
            alt="WaveTip"
            className="banner__logo banner__logo--wavetip"
            height={24}
          />
        </div>
      </div>
    </div>
  );
}
