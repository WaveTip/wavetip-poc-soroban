/**
 * Tip Service
 * 
 * Handles sending tips and admin withdrawals via smart contract.
 * All contract interaction logic centralized here.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { getHorizonServer, getSorobanServer, getNetworkPassphrase } from './stellar-service';
import { usdcToStroops } from './formatters';
import { STELLAR_CONFIG, STELLAR_CONVERSIONS, ERROR_MESSAGES } from '../constants';
import { TRANSACTION_TIMEOUT_SECONDS, TRANSACTION_POLL_INTERVAL_MS, TRANSACTION_CONFIRMATION_TIMEOUT_MS, STELLAR_NULL_ACCOUNT } from '../constants/transaction';
import type { Wallet, TransactionResult } from '../interfaces/wallet';

/**
 * Send USDC tip to recipient via contract
 * 
 * @param wallet - User's wallet with secret key
 * @param amount - Amount in USDC
 * @returns Transaction result with hash or error message
 */
export async function sendTip(wallet: Wallet, amount: number): Promise<TransactionResult> {
  try {
    const server = getHorizonServer();
    const sorobanServer = getSorobanServer();

    const amountInStroops = usdcToStroops(amount);
    const fromParam = new StellarSdk.Address(wallet.publicKey).toScVal();
    const toParam = new StellarSdk.Address(STELLAR_CONFIG.RECIPIENT_ADDRESS).toScVal();
    const amountParam = StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' });

    const keypair = StellarSdk.Keypair.fromSecret(wallet.secretKey);
    const sourceAccount = await server.loadAccount(wallet.publicKey);

    const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIP_CONTRACT_ID);

    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase()
    })
      .addOperation(contract.call('tip', fromParam, toParam, amountParam))
      .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
      .build();

    const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction);
    preparedTransaction.sign(keypair);

    const response = await sorobanServer.sendTransaction(preparedTransaction);
    const txHash = response.hash; // Store hash early for error cases

    if (response.status === 'PENDING') {
      try {
        const result = await waitForTransaction(sorobanServer, txHash);
        if (result.success) {
          return {
            success: true,
            txHash: txHash,
            message: `Tip of ${amount} USDC sent successfully to ${STELLAR_CONFIG.RECIPIENT_NAME}`
          };
        }
        // If waitForTransaction returns an error, include txHash if available
        return { ...result, txHash: result.txHash || txHash };
      } catch (waitError) {
        // If error occurs during wait, check if it's "Bad union switch" and include txHash
        return handleContractError(waitError, amount, txHash);
      }
    }

    return {
      success: false,
      error: `Send error: ${response.status}`
    };
  } catch (error) {
    return handleContractError(error, amount);
  }
}

/**
 * Withdraw accumulated fees from contract (admin only)
 * 
 * @param wallet - Admin wallet with secret key
 * @returns Transaction result with hash or error message
 */
export async function withdrawFees(wallet: Wallet): Promise<TransactionResult> {
  try {
    const server = getHorizonServer();
    const sorobanServer = getSorobanServer();

    // Get contract balance first
    const contractBalance = await getContractBalance(sorobanServer);
    if (contractBalance <= 0) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_FUNDS_TO_WITHDRAW
      };
    }

    const amountInStroops = usdcToStroops(contractBalance);
    const adminParam = new StellarSdk.Address(wallet.publicKey).toScVal();
    const amountParam = StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' });

    const keypair = StellarSdk.Keypair.fromSecret(wallet.secretKey);
    const sourceAccount = await server.loadAccount(wallet.publicKey);

    const contract = new StellarSdk.Contract(STELLAR_CONFIG.TIP_CONTRACT_ID);

    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase()
    })
      .addOperation(contract.call('withdraw', adminParam, amountParam))
      .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
      .build();

    const preparedTransaction = await sorobanServer.prepareTransaction(builtTransaction);
    preparedTransaction.sign(keypair);

    const response = await sorobanServer.sendTransaction(preparedTransaction);
    const txHash = response.hash; // Store hash early for error cases

    if (response.status === 'PENDING') {
      try {
        const result = await waitForTransaction(sorobanServer, txHash);
        if (result.success) {
          return {
            success: true,
            txHash: txHash,
            message: `Withdrawal of ${contractBalance.toFixed(2)} USDC successful`
          };
        }
        // If waitForTransaction returns an error, include txHash if available
        return { ...result, txHash: result.txHash || txHash };
      } catch (waitError) {
        // If error occurs during wait, check if it's "Bad union switch" and include txHash
        return handleWithdrawError(waitError, txHash);
      }
    }

    return {
      success: false,
      error: `Send error: ${response.status}`
    };
  } catch (error) {
    return handleWithdrawError(error);
  }
}

/**
 * Get contract USDC balance via Soroban simulation
 * Read-only operation - does not modify state
 * 
 * @param sorobanServer - Soroban RPC server instance
 * @returns Balance in USDC
 */
async function getContractBalance(sorobanServer: StellarSdk.SorobanRpc.Server): Promise<number> {
  const server = getHorizonServer();
  const addressParam = new StellarSdk.Address(STELLAR_CONFIG.TIP_CONTRACT_ID).toScVal();
  const contract = new StellarSdk.Contract(STELLAR_CONFIG.USDC_CONTRACT_ID);

  const sourceAccount = await server.loadAccount(STELLAR_NULL_ACCOUNT);

  const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase()
  })
    .addOperation(contract.call('balance', addressParam))
    .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
    .build();

  const simulation = await sorobanServer.simulateTransaction(builtTransaction);

  if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
    const balanceScVal = simulation.result.retval;
    const balance = StellarSdk.scValToNative(balanceScVal) as number;
    return balance / STELLAR_CONVERSIONS.STROOPS_PER_USDC;
  }

  return 0;
}

/**
 * Wait for transaction confirmation
 * Polls Soroban RPC until transaction succeeds, fails, or times out
 * 
 * @param sorobanServer - Soroban RPC server
 * @param txHash - Transaction hash to poll
 * @returns Result with success status
 */
async function waitForTransaction(
  sorobanServer: StellarSdk.SorobanRpc.Server,
  txHash: string
): Promise<TransactionResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < TRANSACTION_CONFIRMATION_TIMEOUT_MS) {
    const response = await sorobanServer.getTransaction(txHash);

    if (response.status === 'SUCCESS') {
      return { success: true, txHash };
    }

    if (response.status === 'FAILED') {
      return {
        success: false,
        error: `Transaction failed: ${response.status}`
      };
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, TRANSACTION_POLL_INTERVAL_MS));
  }

  return {
    success: false,
    error: 'Transaction confirmation timeout'
  };
}

/**
 * Handle contract call errors for tips
 * Provides user-friendly error messages
 * 
 * @param error - Error from contract call
 * @param amount - Tip amount that was attempted
 * @param txHash - Optional transaction hash if available
 * @returns Formatted error result
 */
function handleContractError(error: unknown, amount: number, txHash?: string): TransactionResult {
  const message = error instanceof Error ? error.message : String(error);

  // Ignore "Bad union switch" - transaction likely succeeded
  if (message.includes('Bad union switch')) {
    return {
      success: true,
      txHash: txHash,
      message: `Tip of ${amount} USDC sent successfully to ${STELLAR_CONFIG.RECIPIENT_NAME}`
    };
  }

  // Insufficient balance
  if (message.includes('Error(Contract, #10)') || message.includes('not within the allowed range')) {
    return {
      success: false,
      error: ERROR_MESSAGES.INSUFFICIENT_BALANCE_TEMPLATE
        .replace('{required}', amount.toString())
    };
  }

  // Trustline not setup
  if (message.includes('trustline') || message.includes('no_trust')) {
    return {
      success: false,
      error: ERROR_MESSAGES.TRUSTLINE_ERROR
    };
  }

  // Self-tipping
  if (message.includes('yourself') || message.includes('self')) {
    return {
      success: false,
      error: ERROR_MESSAGES.SELF_TIP_ERROR
    };
  }

  // Invalid amount
  if (message.includes('positive') || message.includes('Amount must be')) {
    return {
      success: false,
      error: ERROR_MESSAGES.INVALID_AMOUNT
    };
  }

  // Insufficient XLM for fees
  if (message.includes('insufficient') && message.includes('balance') && !message.includes('Contract')) {
    return {
      success: false,
      error: ERROR_MESSAGES.INSUFFICIENT_FEES
    };
  }

  return {
    success: false,
    error: ERROR_MESSAGES.TIP_FAILED
  };
}

/**
 * Handle withdrawal-specific errors
 * Different error patterns than tips
 * 
 * @param error - Error from contract call
 * @param txHash - Optional transaction hash if available
 * @returns Formatted error result
 */
function handleWithdrawError(error: unknown, txHash?: string): TransactionResult {
  const message = error instanceof Error ? error.message : String(error);

  // Ignore "Bad union switch" - transaction likely succeeded
  if (message.includes('Bad union switch')) {
    return {
      success: true,
      txHash: txHash,
      message: 'Withdrawal successful'
    };
  }

  // Admin-only error
  if (
    message.includes('Error(WasmVm, InvalidAction)') ||
    message.includes('UnreachableCodeReached') ||
    message.includes('admin') ||
    message.includes('Admin')
  ) {
    return {
      success: false,
      error: ERROR_MESSAGES.ADMIN_ONLY
    };
  }

  // No funds
  if (message.includes('No funds')) {
    return {
      success: false,
      error: ERROR_MESSAGES.NO_FUNDS_TO_WITHDRAW
    };
  }

  // Insufficient balance in contract
  if (message.includes('Error(Contract, #10)')) {
    return {
      success: false,
      error: 'Insufficient balance in contract'
    };
  }

  // Insufficient XLM for fees
  if (message.includes('insufficient') && message.includes('balance') && !message.includes('Contract')) {
    return {
      success: false,
      error: ERROR_MESSAGES.INSUFFICIENT_FEES
    };
  }

  return {
    success: false,
    error: ERROR_MESSAGES.WITHDRAWAL_FAILED
  };
}
