import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedSync AI — Intelligent CSV Importer',
  description:
    'AI-powered CSV to CRM importer by Mohit Patil. Upload any CSV and intelligently extract lead information.',
  keywords: 'CSV importer, CRM, leads, AI, VedSync, data import, Gemini AI, Mohit Patil',
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
