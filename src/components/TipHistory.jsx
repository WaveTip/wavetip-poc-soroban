import { useState, useEffect } from 'react'
import * as StellarSdk from '@stellar/stellar-sdk'
import { TIP_CONTRACT_ID, RECIPIENT_ADDRESS, SOROBAN_RPC_URL } from '../utils/constants'
import { truncateHash, stroopsToUsdc } from '../utils/formatters'

export function TipHistory() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTipHistory()
    // Refresh every 30 seconds
    const interval = setInterval(fetchTipHistory, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTipHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use Soroban RPC to get recent events from the contract
      const sorobanServer = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL)
      
      // Get events for the tip function (last 20 events)
      const events = await sorobanServer.getEvents({
        contractIds: [TIP_CONTRACT_ID],
        topics: [['tip']],
        limit: 20
      })
      
      if (!events || !events.events) {
        setTips([])
        return
      }
      
      // Parse events to extract tip information
      const tipList = events.events
        .filter(e => e.type === 'contract' && e.topic?.includes('tip'))
        .map(event => {
          try {
            const data = event.value
            // Event structure: [from, to, amount] based on contract events
            const from = data?.value?.[0]?.address || 'Unknown'
            const to = data?.value?.[1]?.address || RECIPIENT_ADDRESS
            const amountStroops = data?.value?.[2]?.i128 || 0
            const amount = stroopsToUsdc(amountStroops)
            
            return {
              from,
              to,
              amount,
              ledger: event.ledger,
              timestamp: event.timestamp,
              txHash: event.txHash
            }
          } catch (err) {
            console.error('Error parsing event:', err, event)
            return null
          }
        })
        .filter(Boolean)
        .slice(0, 10) // Limit to 10 most recent
      
      setTips(tipList)
    } catch (err) {
      console.error('Error fetching tip history:', err)
      setError('Unable to load tip history')
    } finally {
      setLoading(false)
    }
  }

  if (loading && tips.length === 0) {
    return (
      <div className="card">
        <h2>📜 Recent Tips</h2>
        <p>Loading tip history...</p>
      </div>
    )
  }

  if (error && tips.length === 0) {
    return (
      <div className="card">
        <h2>📜 Recent Tips</h2>
        <p className="message message-error">{error}</p>
      </div>
    )
  }

  if (tips.length === 0) {
    return (
      <div className="card">
        <h2>📜 Recent Tips</h2>
        <p>No tips yet. Be the first to tip!</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>📜 Recent Tips</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>From</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>To</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Amount</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Date</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((tip, index) => (
              <tr key={tip.txHash || index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                  <code style={{ fontSize: '0.75rem' }}>
                    {tip.from && typeof tip.from === 'string' ? truncateHash(tip.from, 6, 6) : 'N/A'}
                  </code>
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                  <code style={{ fontSize: '0.75rem' }}>
                    {RECIPIENT_ADDRESS ? truncateHash(RECIPIENT_ADDRESS, 6, 6) : 'N/A'}
                  </code>
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                  {tip.amount ? `${tip.amount.toFixed(2)} USDC` : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                  {tip.timestamp ? new Date(Number(tip.timestamp) / 1000000).toLocaleString() : 
                   tip.ledger ? `Ledger ${tip.ledger}` : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {tip.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tip.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#667eea', textDecoration: 'underline', fontSize: '0.85rem' }}
                      aria-label={`View transaction ${truncateHash(tip.txHash)}`}
                    >
                      {truncateHash(tip.txHash)}
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

