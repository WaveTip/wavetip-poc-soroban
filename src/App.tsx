/**
 * Soroban Tipping Application
 *
 * Main application component coordinating wallet, tips, and admin functionality.
 * Follows WaveTip design system and extension architecture patterns.
 */

import { useEffect, useState } from 'react';
import { useStellar, useWallet, useBalances, useToast, useTip, useAdmin } from './hooks';
import {
  Banner,
  ContractInfo,
  StreamLayout,
  TipButtons,
  Toast,
  AdminModal
} from './components';
import { ERROR_MESSAGES, LOADING_MESSAGES, SUCCESS_MESSAGES } from './constants/messages';
import { LAYOUT_CLASSES } from './constants/ui';
import { STELLAR_CONFIG, validateStellarConfig } from './constants/stellar';
import './styles/index.css';

/**
 * Main application component
 * Manages state and coordinates all child components
 */
export function App() {
  // Validate environment on startup
  useEffect(() => {
    try {
      validateStellarConfig();
    } catch (error) {
      // Error already logged in validateStellarConfig
    }
  }, []);

  // Initialize Stellar SDK
  const { isInitialized: stellarReady, error: stellarError } = useStellar();

  // Wallet management
  const { wallet, loading: walletLoading, createWalletAsync, disconnectWallet } = useWallet();

  // Balance polling
  const { balances } = useBalances(wallet);

  // Toast notifications
  const { toast, showToast, closeToast } = useToast();

  // Tip operations
  const { loading: tipLoading, sendTipAsync } = useTip(wallet);

  // Admin operations
  const { loading: adminLoading, withdrawAsync } = useAdmin(wallet);

  // Custom amount state
  const [customAmount, setCustomAmount] = useState('');

  // Handle initialization errors
  useEffect(() => {
    if (stellarError) {
      showToast(ERROR_MESSAGES.STELLAR_INIT_FAILED, 'error');
    }
  }, [stellarError, showToast]);

  /**
   * Handle tip sending
   */
  const handleSendTip = async (amount: number) => {
    if (!wallet) {
      showToast(ERROR_MESSAGES.WALLET_REQUIRED, 'error');
      return;
    }

    // Persistent processing toast
    showToast(LOADING_MESSAGES.SENDING_TIP_TEMPLATE.replace('{amount}', amount.toString()).replace('{recipient}', STELLAR_CONFIG.RECIPIENT_NAME), 'info', true);

    const result = await sendTipAsync(amount);

    if (result.success) {
      closeToast();

      // Create explorer link if txHash is available
      let messageWithLink = SUCCESS_MESSAGES.TIP_SENT_TEMPLATE
        .replace('{amount}', amount.toString())
        .replace('{recipient}', STELLAR_CONFIG.RECIPIENT_NAME);

      if (result.txHash) {
        const explorerUrl = `https://stellar.expert/explorer/${
          STELLAR_CONFIG.NETWORK === 'testnet' ? 'testnet' : 'mainnet'
        }/tx/${result.txHash}`;
        const shortTx = `${result.txHash.slice(0, 5)}....${result.txHash.slice(-5)}`;

        messageWithLink = `${messageWithLink} <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">View transaction on explorer ${shortTx} ↗</a>`;
      }

      showToast(messageWithLink, 'success', true);
      setTimeout(() => {
        closeToast();
      }, 5000);
      setCustomAmount('');
    } else {
      closeToast();
      showToast(result.error || ERROR_MESSAGES.TIP_FAILED, 'error');
    }
  };

  /**
   * Handle admin withdrawal
   */
  const handleWithdraw = async () => {
    if (!wallet) {
      showToast(ERROR_MESSAGES.WALLET_REQUIRED, 'error');
      return;
    }

    // Persistent processing toast
    showToast(LOADING_MESSAGES.PROCESSING_WITHDRAWAL, 'info', true);

    const result = await withdrawAsync();

    if (result.success) {
      closeToast();
      showToast(SUCCESS_MESSAGES.WITHDRAWAL_SUCCESS_TEMPLATE, 'success');
    } else {
      closeToast();
      showToast(result.error || ERROR_MESSAGES.WITHDRAWAL_FAILED, 'error');
    }
  };

  const isLoading = walletLoading || tipLoading || adminLoading || !stellarReady;
  const [isFeesModalOpen, setFeesModalOpen] = useState(false);

  return (
    <div className={LAYOUT_CLASSES.APP}>
      {/* Promotional Banner */}
      <Banner />

      <div className="container">
        <div className={LAYOUT_CLASSES.STREAM_SECTION}>
          {/* Stream with Twitch Header */}
          <StreamLayout
            wallet={wallet}
            walletLoading={walletLoading}
            createWalletAsync={createWalletAsync}
            disconnectWallet={disconnectWallet}
            showToast={showToast}
            closeToast={closeToast}
          />

          {/* Tip Controls */}
          {wallet && (
            <TipButtons
              loading={tipLoading}
              wallet={wallet}
              customAmount={customAmount}
              onCustomAmountChange={setCustomAmount}
              onSendTip={handleSendTip}
            />
          )}
        </div>

        {/* Contract Information */}
        <ContractInfo />
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />

      {/* Admin Modal */}
      <AdminModal
        open={isFeesModalOpen}
        onClose={() => setFeesModalOpen(false)}
        wallet={wallet}
        loading={adminLoading}
        onWithdraw={handleWithdraw}
      />

      {/* Loading spinner removed; rely on toasts for progress feedback */}
    </div>
  );
}

export default App;
