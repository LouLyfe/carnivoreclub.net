import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

// "Butcher's Reserve" typography — Brand Guidelines v1, Section 3.
// Fraunces stands in for the "confident serif/slab" heading recommendation;
// Inter covers body text, badges, and UI. Swap either out once exact
// typefaces/licensing are confirmed.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Carnivore Club',
  description: 'A marketplace for verified, high-standard carnivore-diet meat and organ suppliers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
