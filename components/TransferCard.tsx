'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { WalletPickerModal } from './WalletPickerModal';

export function TransferCard() {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-[28px] border border-white/[0.10] bg-[#101012] p-1 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <div className="rounded-[24px] bg-[#101012] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-medium tracking-tight text-white">Send</h2>
            <button className="text-white/50 transition-colors hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.055]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-white/45">Asset</span>
                <span className="text-[13px] font-medium text-white/45">
                  Balance: —
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[36px] font-medium leading-none tracking-tight text-white">—</span>
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 transition-transform hover:scale-[1.03]">
                  <span className="text-[14px] font-medium text-white">Select</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 text-[13px] font-normal text-white/40">≈ $—</div>
            </div>

            <div className="flex justify-center py-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#17171A] transition-transform hover:rotate-180">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="mb-3 text-[13px] font-medium text-white/45">Recipient</div>
              <div className="text-[14px] font-medium text-white">
                Auto-filled after connecting
              </div>
            </div>
          </div>

          <button
            onClick={() => setPickerOpen(true)}
            className="mt-4 w-full rounded-full bg-[#2F6BFF] py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#477DFF]"
          >
            Connect Wallet
          </button>
        </div>
      </motion.div>

      <WalletPickerModal open={pickerOpen} onOpenChange={setPickerOpen} />
    </div>
  );
}
