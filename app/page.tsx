'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TransferCard } from '@/components/TransferCard';

const FEATURES = [
  { title: 'One-click sweep', body: 'Every wallet. Every chain. One confirmation.', color: '#2F6BFF' },
  { title: 'Audited by Blockaid', body: 'Real-time threat detection on every signature.', color: '#8B7CFF' },
  { title: 'Zero-fee routing', body: 'We never charge routing or platform fees.', color: '#3ECF8E' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#000] text-white">
      <Navbar />
      <section className="relative mx-auto flex max-w-[1280px] flex-col items-center px-5 pb-16 pt-20 sm:px-6 lg:pb-24 lg:pt-28">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[600px] w-[min(100%,1000px)] -translate-x-1/2" style={{ background: 'radial-gradient(ellipse at center, rgba(47,107,255,.20) 0%, rgba(0,0,0,0) 68%)' }} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative mb-6 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
          Audited <span className="mx-2 text-[#2F6BFF]">·</span> 7 chains <span className="mx-2 text-[#2F6BFF]">·</span> 0 fees
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="relative mb-5 max-w-[900px] text-center text-[42px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[56px] md:text-[72px]">
          Move crypto <span className="text-white/45">without</span><br className="hidden sm:block" /> the friction.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative mb-12 max-w-[540px] text-center text-[15px] leading-7 text-white/55 sm:text-base">
          Send, receive, and manage your assets across 7 chains in one simple flow.
        </motion.p>
        <div className="relative w-full"><TransferCard /></div>
        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/40"><span>Multi-chain</span><span className="text-[#2F6BFF]">✳</span><span>Wallet-aware</span><span className="text-[#2F6BFF]">✳</span><span>Built for self-custody</span></div>
      </section>
      <section className="mx-auto grid max-w-[1000px] gap-3 px-5 pb-20 sm:px-6 md:grid-cols-3">
        {FEATURES.map((f, i) => <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }} className="rounded-[20px] border border-white/[0.09] bg-[#0D0D0F] p-6 transition-colors hover:border-white/20">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/10 bg-white/[0.04]"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color, boxShadow: `0 0 18px ${f.color}88` }} /></div>
          <div className="mb-2 text-[16px] font-medium tracking-tight text-white">{f.title}</div><div className="text-[13px] leading-6 text-white/50">{f.body}</div>
        </motion.div>)}
      </section>
      
      <Footer />
    </main>
  );
}
