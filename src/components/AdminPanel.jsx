export function AdminPanel({ loading, wallet, onWithdraw }) {
  return (
    <div className="card admin-card">
      <h2>👑 Admin</h2>
      <p className="admin-info">
        Only the admin can withdraw accumulated fees from the contract
      </p>
      <button 
        onClick={onWithdraw} 
        disabled={loading || !wallet}
        className="btn btn-admin"
        aria-label="Withdraw accumulated fees from the contract (admin only)"
      >
        💼 Withdraw Fees
      </button>
    </div>
  )
}

