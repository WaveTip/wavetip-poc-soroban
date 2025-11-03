/**
 * Stream Layout Component with Twitch-Inspired Header
 *
 * Displays live Twitch stream with channel information and chat.
 * Uses static profile picture URL from constants.
 */

import { CARD_CLASSES, UI_LABELS, BUTTON_CLASSES } from '../constants/ui';
import { STELLAR_CONFIG } from '../constants/stellar';
import { useBalances } from '../hooks';
import type { Wallet } from '../interfaces/wallet';
import { formatBalance } from '../lib/formatters';

/**
 * Stream layout component with Twitch header, live stats, and wallet button
 *
 * @returns Stream and chat layout element
 */
interface StreamLayoutProps {
  wallet: Wallet | null;
  walletLoading: boolean;
  createWalletAsync: () => Promise<unknown>;
  disconnectWallet: () => void;
  onOpenFeesModal?: () => void;
  showToast?: (message: string, type?: 'error' | 'info' | 'success' | 'warning', persistent?: boolean) => void;
  closeToast?: () => void;
}

export function StreamLayout({ wallet, walletLoading, createWalletAsync, disconnectWallet, onOpenFeesModal, showToast, closeToast }: StreamLayoutProps): JSX.Element {
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const recipientName = STELLAR_CONFIG.RECIPIENT_NAME;
  const twitchChannel = STELLAR_CONFIG.TWITCH_CHANNEL;
  const profilePictureUrl = STELLAR_CONFIG.PROFILE_PICTURE_URL;

  // Fetch balances for stats display (use wallet to get user balance)
  const { balances } = useBalances(wallet);

  /**
   * Handle create wallet
   */
  const handleCreateWallet = async () => {
    try {
      showToast && showToast('Creating account…', 'info', true);
    await createWalletAsync();
      closeToast && closeToast();
      showToast && showToast('Account created successfully', 'success');
    } catch (e) {
      closeToast && closeToast();
      showToast && showToast('Account creation failed', 'error');
    }
  };

  /**
   * Handle disconnect wallet
   */
  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <>
      {/* Twitch-Inspired Stream Header */}
      <div className="stream-info-section">
        {/* Channel Header (Left) */}
        <div className="channel-header">
          <div className="channel-avatar-wrapper">
            <div className="channel-avatar">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${recipientName} profile`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.textContent = recipientName.charAt(0).toUpperCase();
                    }
                  }}
                />
              ) : (
                <span>{recipientName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="live-badge">LIVE</div>
          </div>

          <div className="channel-info">
            <div className="channel-row">
              <div className="channel-stack">
            <div className="channel-name">
              <h1>{recipientName}</h1>
              <div className="verified-badge" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                  <path
                    fillRule="evenodd"
                    d="M12.5 3.5 8 2 3.5 3.5 2 8l1.5 4.5L8 14l4.5-1.5L14 8l-1.5-4.5ZM7 11l4.5-4.5L10 5 7 8 5.5 6.5 4 8l3 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="channel-meta">
              <div className="viewer-count">
                <span className="viewer-dot" />
                <span>Live on Twitch</span>
            </div>
          </div>
        </div>

              {/* Stats inline to the right of name/meta column */}
          <div className="stream-stats">
            <div className="stat-counter">
              <span className="stat-label">Tips</span>
              <span className="stat-value">${formatBalance(balances.recipient)}</span>
            </div>
                <div
                  className="stat-counter clickable"
                  role="button"
                  tabIndex={0}
                  onClick={onOpenFeesModal}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFeesModal && onOpenFeesModal(); } }}
                >
              <span className="stat-label">Fees</span>
              <span className="stat-value">${formatBalance(balances.contract)}</span>
                </div>
              </div>
            </div>
            </div>
          </div>

        {/* Stream Stats and Actions (Right Side) */}
        <div className="stream-actions-group">
          {/* Wallet Section */}
          {wallet ? (
            <div className="wallet-info">
              <div className="wallet-balance">
                <span className="balance-label">Your Balance</span>
                <span className="balance-value">${formatBalance(balances.user)}</span>
              </div>
              <button
                className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_LOGOUT}`}
                onClick={handleDisconnect}
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_PRIMARY}`}
              onClick={handleCreateWallet}
              disabled={walletLoading}
              type="button"
            >
              {walletLoading ? 'Creating...' : 'Create Account'}
            </button>
          )}
        </div>
      </div>

      {/* Stream Player and Chat Grid */}
      <div className="stream-grid">
        {/* Twitch Player Iframe */}
        <div className={CARD_CLASSES.CARD}>
          <iframe
            className="stream-iframe"
            src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${parentHost}&muted=false`}
            title={`${recipientName} Twitch Stream`}
            aria-label={`${recipientName} Twitch live stream`}
            allowFullScreen
          />
        </div>

        {/* Twitch Chat Iframe */}
        <div className={CARD_CLASSES.CARD} style={{ border: '2px solid #ebebeb' }}>
          <iframe
            className="stream-iframe"
            src={`https://www.twitch.tv/embed/${twitchChannel}/chat?parent=${parentHost}&theme=light`}
            title={UI_LABELS.CHAT_TITLE}
            aria-label="Twitch chat for the live stream"
          />
        </div>
      </div>
    </>
  );
}
