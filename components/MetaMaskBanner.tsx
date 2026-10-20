'use client';

import { useEffect, useState } from 'react';
import { isMetaMaskInstalled } from '@/lib/eip6963';

export function MetaMaskBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isMetaMaskInstalled());
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full border-b border-[#1FC7D4]/30 bg-[#E8FBFD] px-4 py-3">
      <p className="mx-auto max-w-[1280px] text-center text-[13px] font-[600] leading-[1.5] text-[#1A1A1A]">
        <span className="text-[#1FC7D4]">MetaMask is not supported.</span>{' '}
        This app works with Trust Wallet, Rabby, Coinbase Wallet, and OKX Wallet.
        Please switch to one of these to continue.
      </p>
    </div>
  );
}
