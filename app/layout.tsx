import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Carnivore Club',
  description: 'A marketplace for verified, high-standard carnivore-diet meat and organ suppliers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
