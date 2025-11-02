# 🪙 USDC Tip Contract - Frontend

Frontend for the USDC tipping contract on Stellar Testnet.

## ✨ Features

- ✅ Create a Stellar wallet
- ✅ Send tips (1, 2, 5 USDC or custom amount)
- ✅ Tips automatically go to Alice with 99% to recipient and 1% fee to contract
- ✅ Admin interface to withdraw fees (with error handling)
- ✅ Real-time balance display:
  - User's USDC balance
  - Recipient's USDC balance (Alice)
  - Contract's USDC balance (accumulated fees)

## 🚀 Installation

```bash
cd front
npm install
```

## 🔐 Environment Setup (Optional but Recommended)

To enable automatic 5 USDC transfer from Bob to new wallets:

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Add Bob's secret key to `.env`:
   ```env
   VITE_BOB_SECRET_KEY=SXXXXXX...YOUR_SECRET_KEY...
   ```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

## 💻 Run the application

```bash
npm run dev
```

The application will be available at http://localhost:3000

## 🔧 Configuration

The contract is configured for:
- **Contract ID**: `CDS4PIWD7U5OGZ6POKJAPYCS63UTWX7C7POKITRL4BERFFFMP2Z35BWB`
- **USDC Token**: `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`
- **Recipient (Alice)**: `GDRBHKEQBG5X55D3ICSBEQHNYXWNS2OVBFE6VO7XKF27PEISPGCQOJVG`
- **Network**: Stellar Testnet

## 📝 Notes

- The created wallet is saved in localStorage
- Balances automatically refresh every 3 seconds (and 1 second after each transaction)
- Only the admin (Alice) can perform withdrawals
- **IMPORTANT**: The created wallet is automatically:
  1. Funded with XLM via Friendbot
  2. Configured with USDC trustline
  3. **Sent 5 USDC from Bob** (if Bob's secret key is configured in `.env`)

## ⚙️ Technical Implementation

### Balance Management

The frontend handles accounts and contracts differently:
- **Normal accounts** (starts with G): uses Horizon API to retrieve balances
- **Contracts** (starts with C): uses Soroban RPC to invoke the USDC contract's `balance` function

### Contract Invocation

The `tip` and `withdraw` functions use:
1. Stellar SDK to create Soroban transactions
2. Soroban RPC to prepare and submit transactions
3. Polling to wait for confirmation (max 30 seconds)

## 🛠️ Technologies

- React 18
- Vite
- Stellar SDK
- Modern CSS with gradients

