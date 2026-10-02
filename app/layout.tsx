import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'LivePulse // Real-Time Activity Feed & WebSocket Stream',
  description: 'Real-time chronological user activity feed with live WebSocket streaming, interactive action dispatcher, event filters, and throughput telemetry.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#05070a] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

