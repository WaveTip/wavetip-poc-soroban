import { BUTTON_CLASSES, CARD_CLASSES, UI_LABELS } from '../../constants/ui';
import { STELLAR_CONFIG } from '../../constants/stellar';
import type { Wallet } from '../../interfaces/wallet';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  loading: boolean;
  onWithdraw: () => void;
}

export function AdminModal({ open, onClose, wallet, loading, onWithdraw }: AdminModalProps): JSX.Element | null {
  if (!open) return null;

  const isAdmin = Boolean(wallet?.publicKey && STELLAR_CONFIG.RECIPIENT_ADDRESS && wallet.publicKey === STELLAR_CONFIG.RECIPIENT_ADDRESS);
  const isDisabled = loading || !isAdmin || !wallet;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <div className={`${CARD_CLASSES.CARD} modal`}> 
        <div className="modal-header">
          <h2 id="admin-modal-title">{UI_LABELS.ADMIN_TITLE}</h2>
          <button className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_SECONDARY} ${BUTTON_CLASSES.BTN_SMALL}`} onClick={onClose} type="button" aria-label="Close">
            Close
          </button>
        </div>
        <p className="admin-info">{UI_LABELS.ADMIN_DESCRIPTION}</p>

        <div className="modal-footer">
          <button
            onClick={onWithdraw}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            className={`${BUTTON_CLASSES.BTN} ${BUTTON_CLASSES.BTN_ADMIN}`}
            aria-busy={loading}
            type="button"
          >
            {UI_LABELS.WITHDRAW_FEES}
          </button>
        </div>
      </div>
    </div>
  );
}


