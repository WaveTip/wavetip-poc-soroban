/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECIPIENT_NAME: string
  readonly VITE_NETWORK: string
  readonly VITE_HORIZON_URL: string
  readonly VITE_SOROBAN_RPC_URL: string
  readonly VITE_TIP_CONTRACT_ID: string
  readonly VITE_USDC_CONTRACT_ID: string
  readonly VITE_RECIPIENT_ADDRESS: string
  readonly VITE_USDC_ISSUER: string
  readonly VITE_BOB_SECRET_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


