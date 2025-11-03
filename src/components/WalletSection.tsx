/**
 * Wallet Section Component
 * 
 * Displays wallet creation button or wallet info with balance and copy-to-clipboard.
 * Allows users to create new wallet or disconnect existing one.
 * Shows formatted USDC balance with copy button for easy sharing.
 * 
 * Usage:
 * ```
 * <WalletSection
 *   wallet={currentWallet}
 *   loading={isCreating}
 *   userBalance="5.00"
 *   onCreateWallet={handleCreate}
 *   onDisconnect={handleDisconnect}
 *   onAddressCopied={showNotification}
 * />
 * ```
 */

import { BUTTON_CLASSES, CARD_CLASSES, SECTION_CLASSES, UI_LABELS } from '../constants/ui';
import { formatBalance } from '../lib/formatters';
import type { Wallet } from '../interfaces/wallet';

/**
 * Component props
 */
interface WalletSectionProps {
  /** Current wallet or null if not connected */
  wallet: Wallet | null;
  /** Whether wallet creation is in progress */
  loading: boolean;
  /** User's current USDC balance (formatted or raw) */
  userBalance: string;
  /** Callback to create a new wallet */
  onCreateWallet: () => void;
  /** Callback to disconnect current wallet */
  onDisconnect: () => void;
  /** Callback when address is successfully copied to clipboard */
  onAddressCopied: () => void;
}

/**
 * Wallet section component
 * 
 * Shows either:
 * - Create wallet button (when not connected)
 * - Wallet address with copy button and balance (when connected)
 * 
 * @param props - Component props
 * @returns Wallet section element
 */
export function WalletSection({
  wallet,
  loading,
  userBalance,
  onCreateWallet,
  onDisconnect,
  onAddressCopied
}: WalletSectionProps): JSX.Element {
  /**
   * Copy wallet address to clipboard
   * Triggers callback on successful copy
   */
  const handleCopyAddress = async (): Promise<void> => {
    if (wallet?.publicKey) {
      await navigator.clipboard.writeText(wallet.publicKey);
      onAddressCopied();
    }
  };

  return (
    <div className={CARD_CLASSES.CARD}>
      <h2>{UI_LABELS.WALLET_TITLE}</h2>

      {!wallet ? (
        // No wallet connected - show create button
        <button
          onClick={onCreateWallet}
          className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_PRIMARY}`}
          disabled={loading}
          aria-disabled={loading}
          aria-label={UI_LABELS.CREATE_WALLET}
          aria-busy={loading}
        >
          {loading ? UI_LABELS.CREATING_WALLET : UI_LABELS.CREATE_WALLET}
        </button>
      ) : (
        // Wallet connected - show address and balance
        <div>
          <div className={SECTION_CLASSES.WALLET_INFO}>
            <p>
              <strong>{UI_LABELS.ADDRESS_LABEL}:</strong>
            </p>
            <div className="wallet-address-container">
              <code className="address">{wallet.publicKey}</code>
              <button
                onClick={handleCopyAddress}
                className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_SECONDARY} ${BUTTON_CLASSES.BTN_SMALL}`}
                aria-label="Copy wallet address to clipboard"
                title={UI_LABELS.COPY_ADDRESS}
              >
                {UI_LABELS.COPY_ADDRESS}
              </button>
            </div>
            <p className="balance">
              <span className="balance-label">{UI_LABELS.BALANCE_LABEL}:</span>
              <span className="balance-amount">{formatBalance(userBalance)} USDC</span>
            </p>
          </div>
          <button
            onClick={onDisconnect}
            className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_SECONDARY} ${BUTTON_CLASSES.BTN_SMALL}`}
            aria-label={UI_LABELS.DISCONNECT_WALLET}
          >
            {UI_LABELS.DISCONNECT_WALLET}
          </button>
        </div>
      )}
    </div>
  );
}
