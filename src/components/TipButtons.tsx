/**
 * Tip Buttons Component
 * 
 * Displays preset tip amount buttons and custom amount input.
 * Handles tip sending with validation and loading states.
 * Shows fee breakdown (99% to recipient, 1% to contract).
 * 
 * Usage:
 * ```
 * <TipButtons
 *   loading={isSending}
 *   wallet={currentWallet}
 *   customAmount={amount}
 *   onCustomAmountChange={setAmount}
 *   onSendTip={handleTip}
 * />
 * ```
 */

import { BUTTON_CLASSES, CARD_CLASSES, SECTION_CLASSES, UI_LABELS } from '../constants/ui';
import { STELLAR_CONFIG } from '../constants/stellar';
import { PRESET_TIP_AMOUNTS, TIP_FEE_DESCRIPTION, CUSTOM_TIP_MIN, CUSTOM_TIP_STEP } from '../constants/tip';
import type { Wallet } from '../interfaces/wallet';

/**
 * Component props
 */
interface TipButtonsProps {
  /** Whether tip is being sent */
  loading: boolean;
  /** Current wallet (null = buttons disabled) */
  wallet: Wallet | null;
  /** Custom tip amount input value */
  customAmount: string;
  /** Callback when custom amount changes */
  onCustomAmountChange: (amount: string) => void;
  /** Callback when tip is sent */
  onSendTip: (amount: number) => void;
}

/**
 * Validate custom tip amount
 * 
 * @param amount - Custom amount as string
 * @returns Parsed amount if valid, null otherwise
 */
function validateCustomAmount(amount: string): number | null {
  const parsed = parseFloat(amount);
  
  if (!amount || isNaN(parsed) || parsed <= 0) {
    return null;
  }
  
  return parsed;
}

/**
 * Tip buttons component
 * 
 * Displays:
 * - Preset tip buttons (1, 2, 5 USDC)
 * - Custom amount input with send button
 * - Fee breakdown information
 * 
 * @param props - Component props
 * @returns Tip buttons element
 */
export function TipButtons({
  loading,
  wallet,
  customAmount,
  onCustomAmountChange,
  onSendTip
}: TipButtonsProps): JSX.Element {
  const isDisabled = loading || !wallet;
  const recipientName = STELLAR_CONFIG.RECIPIENT_NAME;

  /**
   * Handle custom amount submission
   * Validates amount and triggers send callback
   */
  const handleCustomSend = () => {
    const amount = validateCustomAmount(customAmount);
    if (amount !== null) {
      onSendTip(amount);
      onCustomAmountChange('');
    }
  };

  /**
   * Check if custom send button should be enabled
   */
  const isCustomSendDisabled = isDisabled || !customAmount || validateCustomAmount(customAmount) === null;

  return (
    <div className={CARD_CLASSES.CARD}>
      <h2>{UI_LABELS.TIP_TITLE} to {recipientName}</h2>
      <p className="tip-info">
        {recipientName} receives {TIP_FEE_DESCRIPTION}
      </p>

      {/* Preset Amount Buttons */}
      <div className={SECTION_CLASSES.TIP_BUTTONS}>
        {PRESET_TIP_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onSendTip(amount)}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_TIP}`}
            aria-label={`Send ${amount} USDC tip`}
          >
            {amount} USDC
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className={SECTION_CLASSES.CUSTOM_TIP}>
        <input
          type="number"
          min={CUSTOM_TIP_MIN}
          step={CUSTOM_TIP_STEP}
          value={customAmount}
          onChange={(e) => onCustomAmountChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isCustomSendDisabled) {
              e.preventDefault();
              handleCustomSend();
            }
          }}
          placeholder={UI_LABELS.CUSTOM_AMOUNT_PLACEHOLDER}
          disabled={isDisabled}
          className="input"
          aria-label="Enter custom tip amount in USDC"
        />
        <button
          onClick={handleCustomSend}
          disabled={isCustomSendDisabled}
          aria-disabled={isCustomSendDisabled}
          className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_TIP}`}
          aria-label="Send custom tip amount"
        >
          {UI_LABELS.SEND_TIP}
        </button>
      </div>
    </div>
  );
}
