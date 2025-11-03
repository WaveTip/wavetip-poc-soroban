/**
 * Balance Card Component
 * 
 * Displays USDC balances for recipient and contract in a two-column grid.
 * Each balance shows current amount, formatted with 2 decimal places.
 * Updates automatically as balances change.
 * 
 * Usage:
 * ```
 * <BalanceCard 
 *   recipientBalance="2.64"
 *   contractBalance="0.05"
 * />
 * ```
 */

import { CARD_CLASSES, SECTION_CLASSES, UI_LABELS } from '../constants/ui';
import { STELLAR_CONFIG } from '../constants/stellar';
import { formatBalance } from '../lib/formatters';
import type { BalanceData } from '../interfaces/wallet';

/**
 * Component props
 */
interface BalanceCardProps {
  /** Recipient's current USDC balance (as string) */
  recipientBalance: string;
  /** Contract's accumulated fees USDC balance (as string) */
  contractBalance: string;
}

/**
 * Single balance stat card sub-component
 * 
 * @param label - Display label
 * @param balance - Balance amount (formatted)
 * @param hint - Hint text below balance
 * @returns Stat card element
 */
function BalanceStatCard(
  label: string,
  balance: string,
  hint: string
): JSX.Element {
  return (
    <div className={CARD_CLASSES.STAT_CARD}>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{balance} USDC</div>
        <div className="stat-hint">{hint}</div>
      </div>
    </div>
  );
}

/**
 * Balance card component
 * 
 * Displays two stat cards in a responsive grid:
 * - Recipient balance (99% of tips)
 * - Contract balance (1% fees)
 * 
 * @param props - Component props
 * @returns Balance card element
 */
export function BalanceCard({ recipientBalance, contractBalance }: BalanceCardProps): JSX.Element {
  const recipientName = STELLAR_CONFIG.RECIPIENT_NAME;
  const formattedRecipientBalance = formatBalance(recipientBalance);
  const formattedContractBalance = formatBalance(contractBalance);

  return (
    <div className={SECTION_CLASSES.STATS_GRID}>
      {BalanceStatCard(
        recipientName,
        formattedRecipientBalance,
        UI_LABELS.RECIPIENT_HINT
      )}
      {BalanceStatCard(
        UI_LABELS.CONTRACT_LABEL,
        formattedContractBalance,
        UI_LABELS.CONTRACT_HINT
      )}
    </div>
  );
}
