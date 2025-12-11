import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Moovelabs - Simulateur de Volume pour Déménagement',
  description: 'Calculez le volume de votre déménagement en quelques clics. Obtenez un devis gratuit et rapide.',
  keywords: ['déménagement', 'volume', 'calculateur', 'devis', 'meubles', 'Suisse'],
  authors: [{ name: 'Moovelabs' }],
  openGraph: {
    title: 'Moovelabs - Simulateur de Volume pour Déménagement',
    description: 'Calculez le volume de votre déménagement en quelques clics.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

