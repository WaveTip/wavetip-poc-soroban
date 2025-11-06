/**
 * Stream Layout Component with Twitch-Inspired Header
 *
 * Displays live Twitch stream with channel information and chat.
 * Uses static profile picture URL from constants.
 */

import { CARD_CLASSES, UI_LABELS, BUTTON_CLASSES } from '../constants/ui';
import { useEffect, useRef, useState } from 'react';
import { STELLAR_CONFIG } from '../constants/stellar';
import { SUCCESS_MESSAGES } from '../constants/messages';
import { useBalances } from '../hooks';
import type { Wallet, WalletCreationResult } from '../interfaces/wallet';
import { formatBalance, truncateAddress } from '../lib/formatters';

/**
 * Stream layout component with Twitch header, live stats, and wallet button
 *
 * @returns Stream and chat layout element
 */
interface StreamLayoutProps {
  wallet: Wallet | null;
  walletLoading: boolean;
  createWalletAsync: (onProgress?: (message: string) => void) => Promise<WalletCreationResult>;
  disconnectWallet: () => void;
  showToast?: (message: string, type?: 'error' | 'info' | 'success' | 'warning', persistent?: boolean) => void;
  closeToast?: () => void;
}

export function StreamLayout({ wallet, walletLoading, createWalletAsync, disconnectWallet, showToast, closeToast }: StreamLayoutProps): JSX.Element {
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const recipientName = STELLAR_CONFIG.RECIPIENT_NAME;
  const twitchChannel = STELLAR_CONFIG.TWITCH_CHANNEL;
  const profilePictureUrl = STELLAR_CONFIG.PROFILE_PICTURE_URL;

  // Fetch balances for stats display (use wallet to get user balance)
  const { balances } = useBalances(wallet);

  // Copy-to-clipboard UI state
  const [copied, setCopied] = useState(false);
  const copyResetTimeoutRef = useRef<number | null>(null);

  /**
   * Handle create wallet
   */
  const handleCreateWallet = async () => {
    try {
      // persistent progress toast, updated per step
      showToast && showToast('Creating wallet…', 'info', true);
      const result = await createWalletAsync((msg) => {
        closeToast && closeToast();
        showToast && showToast(msg, 'info', true);
      });
      closeToast && closeToast();
      if (result && result.success) {
        showToast && showToast('Account created successfully', 'success');
      } else {
        const errMsg = result && result.error ? result.error : 'Account creation failed';
        showToast && showToast(errMsg, 'error');
      }
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

  /** Copy current wallet address to clipboard */
  const handleCopyAddress = async () => {
    try {
      if (wallet?.publicKey) {
        await navigator.clipboard.writeText(wallet.publicKey);
        showToast && showToast(SUCCESS_MESSAGES.ADDRESS_COPIED, 'success');
        setCopied(true);
        if (copyResetTimeoutRef.current) {
          window.clearTimeout(copyResetTimeoutRef.current);
        }
        copyResetTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // no-op
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

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
              <div className="wallet-address">
                <span className="balance-label">{UI_LABELS.ADDRESS_LABEL}</span>
                <div className="address-row">
                  <a
                    href={`https://stellar.expert/explorer/${STELLAR_CONFIG.NETWORK === 'testnet' ? 'testnet' : 'mainnet'}/account/${wallet.publicKey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-code"
                    aria-label="Open address in explorer"
                    title="Open in explorer"
                  >
                    {truncateAddress(wallet.publicKey)}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    aria-label={copied ? 'Copied' : UI_LABELS.COPY_ADDRESS}
                    title={copied ? 'Copied' : UI_LABELS.COPY_ADDRESS}
                    className={`address-copy-btn${copied ? ' is-copied' : ''}`}
                  >
                    {copied ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="icon icon--copied"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="icon icon--copy"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
                        />
                      </svg>
                    )}
                  </button>
                </div>
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
