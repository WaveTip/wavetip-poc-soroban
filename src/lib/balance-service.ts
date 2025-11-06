/**
 * Balance Service
 * 
 * Fetches and manages USDC balances for accounts and contracts.
 * Handles both Horizon (for accounts) and Soroban RPC (for contracts).
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { getHorizonServer, getSorobanServer } from './stellar-service';
import { stroopsToUsdc } from './formatters';
import { STELLAR_CONFIG, STELLAR_CONVERSIONS } from '../constants';
import { TRANSACTION_TIMEOUT_SECONDS, TRANSACTION_POLL_INTERVAL_MS, STELLAR_NULL_ACCOUNT, CONTRACT_ADDRESS_PREFIX } from '../constants/transaction';
import type { BalanceData } from '../interfaces/wallet';

/**
 * Get USDC balance for any address (account or contract)
 * Automatically detects type and uses appropriate method
 * 
 * @param address - Stellar account address or contract ID
 * @returns USDC balance as string, or '0' on error
 */
export async function getUSDCBalance(address: string): Promise<string> {
  try {
    if (address.startsWith(CONTRACT_ADDRESS_PREFIX)) {
      return await getContractUSDCBalance(address);
    }
    return await getAccountUSDCBalance(address);
  } catch (error) {
    console.error('Error getting balance for', address, error);
    return '0';
  }
}

/**
 * Get USDC balance for a standard account via Horizon API
 * 
 * @param address - Account public key
 * @returns USDC balance as string, or '0' if not found
 */
async function getAccountUSDCBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`${STELLAR_CONFIG.HORIZON_URL}/accounts/${address}`);

    if (!response.ok) {
      return '0';
    }

    const account = await response.json();
    const usdcBalance = account.balances.find(
      (b: any) => b.asset_code === STELLAR_CONFIG.USDC_CODE && b.asset_issuer === STELLAR_CONFIG.USDC_ISSUER
    );

    return usdcBalance ? usdcBalance.balance : '0';
  } catch (error) {
    console.error('Error getting account balance:', error);
    return '0';
  }
}

/**
 * Get USDC balance for a contract via Soroban RPC
 * Uses contract simulation to query the balance without modifying state
 * 
 * @param contractAddress - Contract address (starts with 'C')
 * @returns USDC balance as string, or '0' on error
 */
async function getContractUSDCBalance(contractAddress: string): Promise<string> {
  try {
    const server = getHorizonServer();
    const sorobanServer = getSorobanServer();

    // Create the Address parameter for the contract
    const addressParam = new StellarSdk.Address(contractAddress).toScVal();

    // Create the contract client
    const contract = new StellarSdk.Contract(STELLAR_CONFIG.USDC_CONTRACT_ID);

    // Prepare the transaction to invoke 'balance'
    const sourceAccount = await server.loadAccount(STELLAR_NULL_ACCOUNT);

    const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
      .addOperation(contract.call('balance', addressParam))
      .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
      .build();

    // Simulate the transaction to get the result
    const simulation = await sorobanServer.simulateTransaction(builtTransaction);

    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulation)) {
      const balanceScVal = simulation.result.retval;
      const balance = StellarSdk.scValToNative(balanceScVal) as number;
      return stroopsToUsdc(balance).toString();
    }

    return '0';
  } catch (error) {
    console.error('Error getting contract balance:', error);
    return '0';
  }
}

/**
 * Refresh all balances (user, recipient, contract)
 * Fetches all three in parallel for efficiency
 * 
 * @param walletAddress - User's wallet address (can be empty)
 * @returns Object with user, recipient, and contract balances
 */
export async function refreshAllBalances(walletAddress: string): Promise<BalanceData> {
  try {
    // Always fetch recipient and contract balances
    const recipientBal = await getUSDCBalance(STELLAR_CONFIG.RECIPIENT_ADDRESS);
    const contractBal = await getUSDCBalance(STELLAR_CONFIG.TIP_CONTRACT_ID);

    // Only fetch user balance if wallet address is provided
    const userBal = walletAddress ? await getUSDCBalance(walletAddress) : '0';

    return {
      user: userBal,
      recipient: recipientBal,
      contract: contractBal
    };
  } catch (error) {
    console.error('Error refreshing balances:', error);
    return {
      user: '0',
      recipient: '0',
      contract: '0'
    };
  }
}
