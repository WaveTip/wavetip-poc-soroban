import { RECIPIENT_NAME } from '../utils/constants'

export function TipButtons({ loading, wallet, customAmount, onCustomAmountChange, onSendTip }) {
  return (
    <div className="card">
      <h2>💸 Send a Tip to {RECIPIENT_NAME}</h2>
      <p className="tip-info">
        {RECIPIENT_NAME} receives 99%, contract keeps 1% fee
      </p>
      <div className="tip-buttons">
        <button 
          onClick={() => onSendTip(1)} 
          disabled={loading || !wallet}
          className="btn btn-tip"
          aria-label="Send 1 USDC tip"
        >
          1 USDC
        </button>
        <button 
          onClick={() => onSendTip(2)} 
          disabled={loading || !wallet}
          className="btn btn-tip"
          aria-label="Send 2 USDC tip"
        >
          2 USDC
        </button>
        <button 
          onClick={() => onSendTip(5)} 
          disabled={loading || !wallet}
          className="btn btn-tip"
          aria-label="Send 5 USDC tip"
        >
          5 USDC
        </button>
      </div>
      
      <div className="custom-tip">
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={customAmount}
          onChange={(e) => onCustomAmountChange(e.target.value)}
          placeholder="Custom amount"
          disabled={loading || !wallet}
          className="input-custom"
          aria-label="Enter custom tip amount in USDC"
        />
        <button 
          onClick={() => {
            if (customAmount && parseFloat(customAmount) > 0) {
              onSendTip(parseFloat(customAmount))
              onCustomAmountChange('')
            }
          }}
          disabled={loading || !wallet || !customAmount}
          className="btn btn-custom"
          aria-label="Send custom tip amount"
        >
          Send
        </button>
      </div>
    </div>
  )
}

