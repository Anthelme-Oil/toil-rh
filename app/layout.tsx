import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'COMPEL STSL T-OIL — Intranet',
    template: '%s | COMPEL STSL T-OIL',
  },
  description:
    'Portail intranet collaboratif COMPEL STSL T-OIL — Ensemble, performants et engagés. Accédez aux actualités, outils, documents et demandes internes.',
  keywords: ['intranet', 'T-OIL', 'COMPEL', 'STSL', 'portail', 'Microsoft 365'],
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-alt">{children}</body>
    </html>
  );
}
