/**
 * Wallet Service
 * 
 * Handles wallet creation, funding, and trustline setup.
 * All wallet operations isolated from UI logic.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { getHorizonServer, getNetworkPassphrase } from './stellar-service';
import { STELLAR_CONFIG, STELLAR_CONVERSIONS } from '../constants';
import { INITIAL_USDC_AMOUNT, FRIENDBOT_ACCOUNT_CREATION_DELAY_MS, FRIENDBOT_REQUEST_TIMEOUT_MS } from '../constants/wallet';
import { TRANSACTION_TIMEOUT_SECONDS } from '../constants/transaction';
import type { Wallet, WalletCreationResult } from '../interfaces/wallet';

/**
 * Create new Stellar wallet with full setup
 * 
 * Process:
 * 1. Generate random keypair
 * 2. Fund via Friendbot (testnet)
 * 3. Setup USDC trustline
 * 4. Send initial USDC from Bob
 * 
 * @returns Wallet creation result with status and messages
 */
export async function createWallet(): Promise<WalletCreationResult> {
  const keypair = StellarSdk.Keypair.random();
  const messages: string[] = [];

  try {
    messages.push('Creating wallet');

    // Fund via Friendbot
    messages.push('Funding account via Friendbot');
    await fundViaFriendbot(keypair.publicKey());

    // Wait for account to be created on blockchain
    await new Promise(resolve => setTimeout(resolve, FRIENDBOT_ACCOUNT_CREATION_DELAY_MS));

    // Setup USDC trustline
    messages.push('Setting up USDC trustline');
    await setupUSDCTrustline(keypair);

    // Send initial USDC from Bob
    if (STELLAR_CONFIG.BOB_SECRET_KEY) {
      messages.push('Sending initial USDC');
      await sendInitialUSDC(keypair.publicKey());
    }

    messages.push('Wallet created successfully');

    return {
      success: true,
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      messages
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Wallet creation failed: ${errorMessage}`,
      messages
    };
  }
}

/**
 * Fund account using Stellar Friendbot (testnet only)
 * 
 * @param publicKey - Account public key to fund
 * @throws Error if funding fails
 */
async function fundViaFriendbot(publicKey: string): Promise<void> {
  const response = await fetch(
    `${STELLAR_CONVERSIONS.TESTNET_FRIENDBOT_URL}?addr=${publicKey}`,
    { signal: AbortSignal.timeout(FRIENDBOT_REQUEST_TIMEOUT_MS) }
  );

  if (!response.ok) {
    throw new Error(`Friendbot funding failed with status ${response.status}`);
  }
}

/**
 * Setup USDC trustline for account
 * Allows account to hold and receive USDC tokens
 * 
 * @param keypair - Account keypair for signing
 * @throws Error if trustline setup fails
 */
async function setupUSDCTrustline(keypair: StellarSdk.Keypair): Promise<void> {
  const server = getHorizonServer();
  const account = await server.loadAccount(keypair.publicKey());
  const usdcAsset = new StellarSdk.Asset(STELLAR_CONFIG.USDC_CODE, STELLAR_CONFIG.USDC_ISSUER);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase()
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: usdcAsset
      })
    )
    .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
    .build();

  transaction.sign(keypair);
  await server.submitTransaction(transaction);
}

/**
 * Send initial USDC from Bob's account to new wallet
 * This gives new users a starting balance
 * 
 * @param destinationAddress - Recipient account address
 * @throws Error if transfer fails
 */
async function sendInitialUSDC(destinationAddress: string): Promise<void> {
  if (!STELLAR_CONFIG.BOB_SECRET_KEY) {
    throw new Error('Bob secret key not configured');
  }

  const server = getHorizonServer();
  const bobKeypair = StellarSdk.Keypair.fromSecret(STELLAR_CONFIG.BOB_SECRET_KEY);
  const bobAccount = await server.loadAccount(bobKeypair.publicKey());
  const usdcAsset = new StellarSdk.Asset(STELLAR_CONFIG.USDC_CODE, STELLAR_CONFIG.USDC_ISSUER);

  const transaction = new StellarSdk.TransactionBuilder(bobAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase()
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: usdcAsset,
        amount: INITIAL_USDC_AMOUNT
      })
    )
    .setTimeout(TRANSACTION_TIMEOUT_SECONDS)
    .build();

  transaction.sign(bobKeypair);
  await server.submitTransaction(transaction);
}
