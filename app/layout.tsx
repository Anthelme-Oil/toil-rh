
import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserProvider } from '@/context/UserContext';

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
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Roboto */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className="min-h-full flex flex-col bg-surface-alt"
        suppressHydrationWarning
      >
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
