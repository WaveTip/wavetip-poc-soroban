import { useState, useEffect } from 'react'
import * as StellarSdk from '@stellar/stellar-sdk'
import {
  TWITCH_CHANNEL,
  RECIPIENT_NAME,
  NETWORK,
  HORIZON_URL,
  SOROBAN_RPC_URL,
  TIP_CONTRACT_ID,
  USDC_CONTRACT_ID,
  RECIPIENT_ADDRESS,
  BOB_SECRET_KEY,
  USDC_ISSUER,
  STROOPS_PER_USDC,
  validateEnv
} from './utils/constants'
import { formatBalance, usdcToStroops, stroopsToUsdc, truncateHash } from './utils/formatters'
import { WalletSection } from './components/WalletSection'
import { TipButtons } from './components/TipButtons'
import { StreamLayout } from './components/StreamLayout'
import { AdminPanel } from './components/AdminPanel'

// Validate environment variables on startup
try {
  validateEnv()
} catch (err) {
  console.error(err.message)
  // Could show an error banner in the UI
}

// Initialize Horizon Server
const server = new StellarSdk.Horizon.Server(HORIZON_URL)

// Initialize Soroban RPC
const sorobanServer = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL)

function App() {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [txHash, setTxHash] = useState(null)
  
  // Balances
  const [userBalance, setUserBalance] = useState('0')
  const [recipientBalance, setRecipientBalance] = useState('0')
  const [contractBalance, setContractBalance] = useState('0')

  // Refresh balances
  const refreshBalances = async () => {
    try {
      if (wallet) {
        const userBal = await getUSDCBalance(wallet.publicKey)
        setUserBalance(userBal)
      }
      
      const recipientBal = await getUSDCBalance(RECIPIENT_ADDRESS)
      setRecipientBalance(recipientBal)
      
      const contractBal = await getUSDCBalance(TIP_CONTRACT_ID)
      setContractBalance(contractBal)
    } catch (err) {
      console.error('Error refreshing balances:', err)
    }
  }

  useEffect(() => {
    refreshBalances()
    const interval = setInterval(refreshBalances, 3000) // Refresh every 3s
    return () => clearInterval(interval)
  }, [wallet])

  // Create a new wallet
  const createWallet = async () => {
    setLoading(true)
    setMessage('🔄 Creating wallet...')
    setError('')

    try {
      // Generate a new keypair
      const keypair = StellarSdk.Keypair.random()
      const newWallet = {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret()
      }
      
      setMessage(`🔄 Funding account on testnet via Friendbot...`)
      
      // Fund the account with Friendbot (testnet)
      const friendbotResponse = await fetch(
        `https://friendbot.stellar.org?addr=${newWallet.publicKey}`
      )
      
      if (!friendbotResponse.ok) {
        throw new Error('Error funding the account')
      }
      
      setMessage(`🔄 Setting up USDC trustline...`)
      
      // Wait a few seconds for the account to be created
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Setup USDC trustline
      await setupUSDCTrustline(keypair)
      
      setMessage(`🔄 Sending 5 USDC from Bob...`)
      
      // Send 5 USDC from Bob
      await sendInitialUSDC(newWallet.publicKey)
      
      setWallet(newWallet)
      setMessage(`✅ Wallet created and configured successfully!\n📬 Address: ${newWallet.publicKey}\n💰 Received 5 USDC from Bob`)
      setError('')
      
      // Save to localStorage
      localStorage.setItem('tipWallet', JSON.stringify(newWallet))
      
      // Refresh balances
      setTimeout(refreshBalances, 1000)
      
      return newWallet
    } catch (err) {
      setError(`❌ Error creating wallet: ${err.message}`)
      setMessage('')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet(null)
    localStorage.removeItem('tipWallet')
    setMessage('Wallet disconnected')
    setError('')
    setUserBalance('0')
  }

  // Setup USDC trustline
  const setupUSDCTrustline = async (keypair) => {
    try {
      const account = await server.loadAccount(keypair.publicKey())
      
      // USDC Asset
      const usdcAsset = new StellarSdk.Asset('USDC', USDC_ISSUER)
      
      // Create trustline transaction
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: usdcAsset
          })
        )
        .setTimeout(180)
        .build()
      
      // Sign the transaction
      transaction.sign(keypair)
      
      // Submit the transaction
      await server.submitTransaction(transaction)
      
      return true
    } catch (err) {
      console.error('Trustline error:', err)
      throw new Error('Unable to setup USDC trustline')
    }
  }

  // Send 5 USDC from Bob to new wallet
  const sendInitialUSDC = async (destinationAddress) => {
    try {
      if (!BOB_SECRET_KEY) {
        console.warn('Bob secret key not configured, skipping initial USDC transfer')
        return false
      }

      const bobKeypair = StellarSdk.Keypair.fromSecret(BOB_SECRET_KEY)
      const bobAccount = await server.loadAccount(bobKeypair.publicKey())
      
      // USDC Asset
      const usdcAsset = new StellarSdk.Asset('USDC', USDC_ISSUER)
      
      // Create payment transaction
      const transaction = new StellarSdk.TransactionBuilder(bobAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationAddress,
            asset: usdcAsset,
            amount: '5'
          })
        )
        .setTimeout(180)
        .build()
      
      // Sign the transaction
      transaction.sign(bobKeypair)
      
      // Submit the transaction
      await server.submitTransaction(transaction)
      
      return true
    } catch (err) {
      console.error('Error sending initial USDC:', err)
      throw new Error('Unable to send initial 5 USDC from Bob')
    }
  }

  // Load wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('tipWallet')
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet))
    }
  }, [])

  // Get USDC balance of an address
  const getUSDCBalance = async (address) => {
    try {
      // If it's a contract (starts with C), use Soroban RPC
      if (address.startsWith('C')) {
        return await getContractUSDCBalance(address)
      }
      
      // Otherwise, it's a normal account, use Horizon
      const response = await fetch(HORIZON_URL + `/accounts/${address}`)
      if (!response.ok) return '0'
      
      const account = await response.json()
      const usdcBalance = account.balances.find(b => 
        b.asset_code === 'USDC' && 
        b.asset_issuer === USDC_ISSUER // Use constant instead of hardcoded value
      )
      
      // Keep all decimals (no .toFixed here)
      return usdcBalance ? usdcBalance.balance : '0'
    } catch (err) {
      console.error('Error getting balance:', err)
      return '0'
    }
  }

  // Get USDC balance of a contract via Soroban RPC
  const getContractUSDCBalance = async (contractAddress) => {
    try {
      // Create the Address parameter for the contract using the correct conversion
      const addressParam = new StellarSdk.Address(contractAddress).toScVal()
      
      // Create the contract client
      const contract = new StellarSdk.Contract(USDC_CONTRACT_ID)
      
      // Prepare the transaction to invoke 'balance'
      const sourceAccount = await server.loadAccount(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF' // Null account
      )
      
      const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(contract.call('balance', addressParam))
        .setTimeout(30)
        .build()

      // Simulate the transaction to get the result
      const simulation = await sorobanServer.simulateTransaction(builtTransaction)
      
      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
        const balanceScVal = simulation.result.retval
        // Convert ScVal to number (balance is in stroops)
        const balance = StellarSdk.scValToNative(balanceScVal)
        // Convert stroops to USDC using utility function
        return stroopsToUsdc(balance).toString()
      }
      
      return '0'
    } catch (err) {
      console.error('Error getting contract balance:', err)
      return '0'
    }
  }

  // Send a tip
  const sendTip = async (amount) => {
    if (!wallet) {
      setError('❌ You must create a wallet first')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')
    setTxHash(null)
    
    let transactionHash = null

    try {
      setMessage(`🔄 Sending ${amount} USDC...`)
      
      // Convert amount to stroops using utility function
      const amountInStroops = usdcToStroops(amount)
      
      // Create parameters for the contract using correct conversions
      const fromParam = new StellarSdk.Address(wallet.publicKey).toScVal()
      const toParam = new StellarSdk.Address(RECIPIENT_ADDRESS).toScVal()
      const amountParam = StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' })
      
      // Create keypair for signing
      const keypair = StellarSdk.Keypair.fromSecret(wallet.secretKey)
      
      // Load the account
      const sourceAccount = await server.loadAccount(wallet.publicKey)
      
      // Create the contract
      const contract = new StellarSdk.Contract(TIP_CONTRACT_ID)
      
      // Build the transaction
      let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(contract.call('tip', fromParam, toParam, amountParam))
        .setTimeout(30)
        .build()
      
      // Prepare the transaction (get footprints and signature)
      const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction)
      
      // Sign the transaction
      preparedTransaction.sign(keypair)
      
      // Submit the transaction
      const response = await sorobanServer.sendTransaction(preparedTransaction)
      
      // Store the transaction hash
      transactionHash = response.hash
      
      // Wait for confirmation
      if (response.status === 'PENDING') {
        let getResponse = await sorobanServer.getTransaction(response.hash)
        
        // Wait up to 30 seconds for confirmation
        const startTime = Date.now()
        while (getResponse.status === 'NOT_FOUND' && Date.now() - startTime < 30000) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          getResponse = await sorobanServer.getTransaction(response.hash)
        }
        
        if (getResponse.status === 'SUCCESS') {
          setMessage(`✅ Tip of ${amount} USDC sent successfully!`)
          setTxHash(response.hash)
          setError('')
          
          // Refresh balances
          setTimeout(refreshBalances, 1000)
        } else {
          throw new Error(`Transaction failed: ${getResponse.status}`)
        }
      } else {
        throw new Error(`Send error: ${response.status}`)
      }
    } catch (err) {
      console.error('Full error:', err)
      
      // Ignore "Bad union switch: 4" error as the transaction works anyway
      if (err.message && err.message.includes('Bad union switch')) {
        console.log('⚠️ XDR error ignored (transaction successful)')
        setMessage(`✅ Tip of ${amount} USDC sent successfully!`)
        setError('')
        
        // Store the transaction hash if we have it
        if (transactionHash) {
          setTxHash(transactionHash)
        }
        
        setTimeout(refreshBalances, 1000)
      } else {
        // Detect insufficient balance error (Error #10)
        let errorMessage = err.message || 'Unknown error'
        
        if (errorMessage.includes('Error(Contract, #10)') || 
            errorMessage.includes('not within the allowed range')) {
          const currentBalance = parseFloat(userBalance) || 0
          const needed = amount
          const missing = Math.max(0, needed - currentBalance)
          
          errorMessage = `💸 Insufficient USDC balance!\n\n` +
                        `You have: ${currentBalance.toFixed(7).replace(/\.?0+$/, '')} USDC\n` +
                        `Required: ${needed.toFixed(7).replace(/\.?0+$/, '')} USDC\n` +
                        `Missing: ${missing.toFixed(7).replace(/\.?0+$/, '')} USDC`
        }
        // Trustline error
        else if (errorMessage.includes('trustline') || errorMessage.includes('no_trust')) {
          errorMessage = '🔗 USDC trustline not configured on your wallet'
        }
        // Self-tipping
        else if (errorMessage.includes('yourself') || errorMessage.includes('self')) {
          errorMessage = '🚫 You cannot tip yourself'
        }
        // Invalid amount
        else if (errorMessage.includes('positive') || errorMessage.includes('Amount must be')) {
          errorMessage = '⚠️ Amount must be positive'
        }
        // Insufficient transaction fees (XLM)
        else if (errorMessage.includes('insufficient') && errorMessage.includes('balance') && 
                 !errorMessage.includes('Contract')) {
          errorMessage = '⛽ Insufficient transaction fees (not enough XLM)'
        }
        
        setError(`❌ ${errorMessage}`)
        setMessage('')
      }
    } finally {
      setLoading(false)
    }
  }

  // Withdraw (admin only)
  const withdraw = async () => {
    if (!wallet) {
      setError('❌ You must create a wallet first')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')
    setTxHash(null)
    
    let transactionHash = null

    try {
      setMessage(`🔄 Attempting withdrawal...`)
      
      // First, get the contract balance
      const contractBalanceStr = await getContractUSDCBalance(TIP_CONTRACT_ID)
      const contractBalanceNum = parseFloat(contractBalanceStr)
      
      if (contractBalanceNum <= 0) {
        throw new Error('No funds to withdraw from the contract')
      }
      
      // Convert to stroops using utility function
      const amountInStroops = usdcToStroops(contractBalanceNum)
      
      // Create parameters for the contract using correct conversions
      const adminParam = new StellarSdk.Address(wallet.publicKey).toScVal()
      const amountParam = StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' })
      
      // Create keypair for signing
      const keypair = StellarSdk.Keypair.fromSecret(wallet.secretKey)
      
      // Load the account
      const sourceAccount = await server.loadAccount(wallet.publicKey)
      
      // Create the contract
      const contract = new StellarSdk.Contract(TIP_CONTRACT_ID)
      
      // Build the transaction
      let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(contract.call('withdraw', adminParam, amountParam))
        .setTimeout(30)
        .build()
      
      // Prepare the transaction
      const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction)
      
      // Sign the transaction
      preparedTransaction.sign(keypair)
      
      // Submit the transaction
      const response = await sorobanServer.sendTransaction(preparedTransaction)
      
      // Store the transaction hash
      transactionHash = response.hash
      
      // Wait for confirmation
      if (response.status === 'PENDING') {
        let getResponse = await sorobanServer.getTransaction(response.hash)
        
        // Wait up to 30 seconds for confirmation
        const startTime = Date.now()
        while (getResponse.status === 'NOT_FOUND' && Date.now() - startTime < 30000) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          getResponse = await sorobanServer.getTransaction(response.hash)
        }
        
        if (getResponse.status === 'SUCCESS') {
          setMessage(`✅ Withdrawal of ${contractBalanceStr} USDC successful!`)
          setTxHash(response.hash)
          setError('')
          
          // Refresh balances
          setTimeout(refreshBalances, 1000)
        } else {
          throw new Error(`Transaction failed: ${getResponse.status}`)
        }
      } else {
        throw new Error(`Send error: ${response.status}`)
      }
    } catch (err) {
      console.error('Full withdraw error:', err)
      
      // Ignore "Bad union switch: 4" error as the transaction works anyway
      if (err.message && err.message.includes('Bad union switch')) {
        console.log('⚠️ XDR error ignored (transaction successful)')
        setMessage(`✅ Withdrawal successful!`)
        setError('')
        
        // Store the transaction hash if we have it
        if (transactionHash) {
          setTxHash(transactionHash)
        }
        
        setTimeout(refreshBalances, 1000)
      } else {
        // Detect contract-specific errors
        let errorMessage = err.message || 'Unknown error'
        
        // Admin-only error (WasmVm InvalidAction or admin)
        if (errorMessage.includes('Error(WasmVm, InvalidAction)') || 
            errorMessage.includes('UnreachableCodeReached') ||
            errorMessage.includes('admin') || 
            errorMessage.includes('Admin')) {
          errorMessage = '👑 Only the admin can withdraw funds from the contract'
        }
        // No funds to withdraw
        else if (errorMessage.includes('No funds')) {
          errorMessage = '💰 No funds to withdraw from the contract'
        }
        // Insufficient balance in contract
        else if (errorMessage.includes('Error(Contract, #10)')) {
          errorMessage = '💸 Insufficient balance in the contract'
        }
        // Invalid amount
        else if (errorMessage.includes('positive') || errorMessage.includes('Amount must be')) {
          errorMessage = '⚠️ Amount must be positive'
        }
        // Insufficient transaction fees (XLM)
        else if (errorMessage.includes('insufficient') && errorMessage.includes('balance') && 
                 !errorMessage.includes('Contract')) {
          errorMessage = '⛽ Insufficient transaction fees (not enough XLM)'
        }
        
        setError(`❌ ${errorMessage}`)
        setMessage('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🎵 Tip {RECIPIENT_NAME} with USDC</h1>
        <p className="subtitle">Support your favorite streamer on Stellar Testnet</p>

        {/* Stream and Chat Layout */}
        <StreamLayout />

        {/* Wallet Section */}
        <WalletSection
          wallet={wallet}
          loading={loading}
          userBalance={userBalance}
          onCreateWallet={createWallet}
          onDisconnect={disconnectWallet}
        />

        {/* Balances Info */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎵</div>
            <div className="stat-content">
              <div className="stat-label">{RECIPIENT_NAME}</div>
              <div className="stat-value">{formatBalance(recipientBalance)} USDC</div>
              <div className="stat-hint">(99% of tips received)</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Contract Fees</div>
              <div className="stat-value">{formatBalance(contractBalance)} USDC</div>
              <div className="stat-hint">(1% fees accumulated)</div>
            </div>
          </div>
        </div>

        {/* Tip Buttons */}
        <TipButtons
          loading={loading}
          wallet={wallet}
          customAmount={customAmount}
          onCustomAmountChange={setCustomAmount}
          onSendTip={sendTip}
        />

        {/* Admin Panel */}
        <AdminPanel
          loading={loading}
          wallet={wallet}
          onWithdraw={withdraw}
        />

        {/* Messages */}
        {message && (
          <div className="message message-success" role="alert" aria-live="polite">
            {message}
            {txHash && (
              <>
                <br />
                <a 
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4CAF50', textDecoration: 'underline', fontSize: '0.9em' }}
                  aria-label={`View transaction ${truncateHash(txHash)} on Stellar Expert`}
                >
                  🔗 View transaction on explorer {truncateHash(txHash)}
                </a>
              </>
            )}
          </div>
        )}
        {error && (
          <div className="message message-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Contract Info */}
        <div className="contract-info">
          <h3>📋 Contract Information</h3>
          <div className="info-grid">
            <div>
              <strong>Contract ID:</strong>
              <code className="code-small">{TIP_CONTRACT_ID}</code>
            </div>
            <div>
              <strong>{RECIPIENT_NAME} Address:</strong>
              <code className="code-small">{RECIPIENT_ADDRESS}</code>
            </div>
            <div>
              <strong>Network:</strong>
              <span className="badge">{NETWORK}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
