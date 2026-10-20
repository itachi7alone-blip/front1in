'use client';

import { useState, useEffect, useRef } from 'react';
import { WalletPickerModal } from './WalletPickerModal';
import { MetaMaskBanner } from './MetaMaskBanner';
import { CHAINS } from '@/lib/chainRegistry';
import { getActiveProvider } from '@/lib/providerStore';

const NAV_ITEMS = [
  { label: 'Swap', active: true },
  { label: 'Explore', active: false },
  { label: 'Portfolio', active: false },
];

export function Navbar() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [currentChain, setCurrentChain] = useState('bsc');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setChainMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    async function readChain() {
      try {
        const provider = getActiveProvider();
        if (!provider?.request) return;
        const idHex: string = await provider.request({ method: 'eth_chainId' });
        const id = parseInt(idHex, 16);
        const match = Object.values(CHAINS).find((c) => c.chainIdDecimal === id);
        if (match) setCurrentChain(match.key);
      } catch {}
    }
    void readChain();
  }, []);

  async function switchChain(key: string) {
    try {
      const provider = getActiveProvider();
      if (!provider?.request) return;
      const cfg = CHAINS[key];
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: cfg.chainIdHex }],
        });
      } catch (err: any) {
        if (err?.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: cfg.chainIdHex,
                chainName: cfg.name,
                nativeCurrency: { name: cfg.nativeSymbol, symbol: cfg.nativeSymbol, decimals: 18 },
                rpcUrls: [cfg.rpcUrl],
                blockExplorerUrls: [cfg.explorer],
              },
            ],
          });
        }
      }
      setCurrentChain(key);
      setChainMenuOpen(false);
    } catch (e) {
      console.warn('switch chain failed', e);
    }
  }

  const current = CHAINS[currentChain];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2">
              {/* <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#2F6BFF] transition-transform hover:scale-105">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 4.1 5.3 3v5.8l-5.3 3-5.3-3V9.1l5.3-3Z" fill="white" />
                </svg>
              </div> */}
              <span className="text-[20px] font-semibold tracking-[-0.04em] text-white">1inch</span>
            </a>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`text-[15px] font-[600] transition-colors ${
                    item.active ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setChainMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 transition-colors hover:bg-white/10"
              >
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: current.color }} />
                <span className="text-[13px] font-medium text-white">{current.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`transition-transform ${chainMenuOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {chainMenuOpen && (
                <div className="absolute right-0 top-[110%] z-50 w-[240px] overflow-hidden rounded-[16px] border border-white/10 bg-[#111113] shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
                  {Object.values(CHAINS).map((c) => (
                    <button
                      key={c.key}
                      onClick={() => switchChain(c.key)}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] ${
                        currentChain === c.key ? 'bg-white/[0.08]' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-[13px] font-medium text-white">{c.name}</span>
                      </span>
                      {currentChain === c.key && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L20 7" stroke="#2F6BFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setPickerOpen(true)}
              className="rounded-full bg-black px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-black"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <MetaMaskBanner />

      <WalletPickerModal open={pickerOpen} onOpenChange={setPickerOpen} />
    </>
  );
}
