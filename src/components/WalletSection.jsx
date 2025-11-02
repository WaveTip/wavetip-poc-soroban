import { formatBalance } from '../utils/formatters'

export function WalletSection({ wallet, loading, userBalance, onCreateWallet, onDisconnect }) {
  return (
    <div className="card">
      <h2>👛 Your Wallet</h2>
      {!wallet ? (
        <button 
          onClick={onCreateWallet} 
          className="btn btn-primary"
          disabled={loading}
          aria-label="Create a new Stellar wallet"
          aria-busy={loading}
        >
          {loading ? '🔄 Creating...' : '✨ Create Wallet'}
        </button>
      ) : (
        <div>
          <div className="wallet-info">
            <p><strong>Address:</strong></p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <code className="address">{wallet.publicKey}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(wallet.publicKey)
                  // Could add a toast notification here
                }}
                className="btn btn-secondary btn-small"
                aria-label="Copy wallet address to clipboard"
                title="Copy address"
              >
                📋 Copy
              </button>
            </div>
            <p className="balance">
              <span className="balance-label">USDC Balance:</span>
              <span className="balance-amount">{formatBalance(userBalance)} USDC</span>
            </p>
          </div>
          <button 
            onClick={onDisconnect} 
            className="btn btn-secondary btn-small"
            aria-label="Disconnect current wallet"
          >
            🔄 Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  )
}

