import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-kanit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '1inch | Move crypto',
  description: 'Send, receive, and manage your crypto assets across multiple chains.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={kanit.variable}>
      <body className="font-kanit">{children}</body>
    </html>
  );
}
