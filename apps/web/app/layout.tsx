import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { QueryProvider } from '@/components/query-provider';
import { ThemeProvider } from '@/components/theme-provider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '9ja Checkr — NAFDAC registration lookup API',
  description:
    'Developer API and tools for NAFDAC registration number lookup (structured JSON). Independent service — not affiliated with NAFDAC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${outfit.variable} h-full scroll-smooth antialiased overflow-x-hidden`}
    >
      <body className="min-h-full min-w-0 overflow-x-hidden font-sans text-[15px] leading-relaxed tracking-[-0.01em]">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
