export interface ChainConfig {
  key: string;
  name: string;
  chainIdHex: string;
  chainIdDecimal: number;
  nativeSymbol: string;
  rpcUrl: string;
  explorer: string;
  color: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    key: 'ethereum',
    name: 'Ethereum',
    chainIdHex: '0x1',
    chainIdDecimal: 1,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    explorer: 'https://etherscan.io',
    color: '#627EEA',
  },
  bsc: {
    key: 'bsc',
    name: 'BNB Smart Chain',
    chainIdHex: '0x38',
    chainIdDecimal: 56,
    nativeSymbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.bnbchain.org',
    explorer: 'https://bscscan.com',
    color: '#F0B90B',
  },
  polygon: {
    key: 'polygon',
    name: 'Polygon',
    chainIdHex: '0x89',
    chainIdDecimal: 137,
    nativeSymbol: 'POL',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    explorer: 'https://polygonscan.com',
    color: '#8247E5',
  },
  arbitrum: {
    key: 'arbitrum',
    name: 'Arbitrum One',
    chainIdHex: '0xa4b1',
    chainIdDecimal: 42161,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    color: '#28A0F0',
  },
  optimism: {
    key: 'optimism',
    name: 'Optimism',
    chainIdHex: '0xa',
    chainIdDecimal: 10,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
    color: '#FF0420',
  },
  base: {
    key: 'base',
    name: 'Base',
    chainIdHex: '0x2105',
    chainIdDecimal: 8453,
    nativeSymbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    color: '#0052FF',
  },
  avalanche: {
    key: 'avalanche',
    name: 'Avalanche C-Chain',
    chainIdHex: '0xa86a',
    chainIdDecimal: 43114,
    nativeSymbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
    color: '#E84142',
  },
};

export function getChainEntry(key: string): ChainConfig | null {
  const normalized = String(key || '').toLowerCase();
  const alias: Record<string, string> = {
    eth: 'ethereum',
    ethereum: 'ethereum',
    bnb: 'bsc',
    bsc: 'bsc',
    'binance-smart-chain': 'bsc',
    matic: 'polygon',
    polygon: 'polygon',
    arbitrum: 'arbitrum',
    optimism: 'optimism',
    base: 'base',
    avalanche: 'avalanche',
    avax: 'avalanche',
  };
  const canonical = alias[normalized] || normalized;
  return CHAINS[canonical] || null;
}
