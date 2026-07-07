import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GrowEasy CSV Importer — AI-Powered CRM Lead Extraction',
  description:
    'Upload any CSV file from Facebook Ads, Google Ads, Excel, or any CRM export. Our AI intelligently maps and extracts your lead data into GrowEasy CRM format.',
  keywords: 'CSV importer, CRM, leads, AI, GrowEasy, data import',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
