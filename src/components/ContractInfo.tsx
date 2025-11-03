/**
 * Contract Information Component
 *
 * Displays Soroban smart contract and configuration details.
 * Simplified card layout with direct links to block explorers.
 */

import { CARD_CLASSES, UI_LABELS } from '../constants/ui';
import { STELLAR_CONFIG } from '../constants/stellar';

/**
 * Get block explorer URL based on network
 */
function getExplorerUrl(address: string): string {
  const baseUrl = STELLAR_CONFIG.NETWORK === 'testnet'
    ? 'https://stellar.expert/explorer/testnet/contract'
    : 'https://stellar.expert/explorer/mainnet/contract';
  
  return `${baseUrl}/${address}`;
}

/**
 * Get account explorer URL
 */
function getAccountExplorerUrl(address: string): string {
  const baseUrl = STELLAR_CONFIG.NETWORK === 'testnet'
    ? 'https://stellar.expert/explorer/testnet/account'
    : 'https://stellar.expert/explorer/mainnet/account';
  
  return `${baseUrl}/${address}`;
}

/**
 * Truncate address for display
 */
function truncateAddress(addr: string, length: number = 16): string {
  if (addr.length <= length) return addr;
  return `${addr.slice(0, length / 2)}...${addr.slice(-length / 2)}`;
}

/**
 * Contract information display component
 *
 * @returns Contract info card element
 */
export function ContractInfo(): JSX.Element {
  const contractId = STELLAR_CONFIG.TIP_CONTRACT_ID || 'Not configured';
  const recipientAddr = STELLAR_CONFIG.RECIPIENT_ADDRESS || 'Not configured';
  const network = STELLAR_CONFIG.NETWORK === 'testnet' ? 'Stellar Testnet' : 'Stellar Mainnet';

  return (
    <div className={`${CARD_CLASSES.CARD} contract-info-card`}>
      <div className="contract-header">
        <h2>{UI_LABELS.CONTRACT_INFO_TITLE}</h2>
        <span className="network-badge">{network}</span>
      </div>

      <div className="contract-list">
        {/* Tip Contract */}
        <a
          href={getExplorerUrl(contractId)}
          target="_blank"
          rel="noopener noreferrer"
          className="contract-link"
        >
          <span className="contract-label">{UI_LABELS.CONTRACT_ID_LABEL}</span>
          <span className="contract-address">{truncateAddress(contractId)}</span>
          <span className="external-icon">↗</span>
        </a>

        {/* Recipient Address */}
        <a
          href={getAccountExplorerUrl(recipientAddr)}
          target="_blank"
          rel="noopener noreferrer"
          className="contract-link"
        >
          <span className="contract-label">
            {UI_LABELS.RECIPIENT_ADDRESS_LABEL_TEMPLATE.replace(
              '{name}',
              STELLAR_CONFIG.RECIPIENT_NAME
            )}
          </span>
          <span className="contract-address">{truncateAddress(recipientAddr)}</span>
          <span className="external-icon">↗</span>
        </a>
      </div>
    </div>
  );
}
