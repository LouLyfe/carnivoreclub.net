import Link from 'next/link';
import Image from 'next/image';
import { getCurrentProfile } from '@/lib/supabase/server';

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-charcoal/10 bg-bone">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="" width={44} height={44} className="h-11 w-11" priority />
          <span className="font-heading text-lg font-semibold tracking-tight text-oxblood">
            Carnivore Club
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/shop">Shop</Link>
          <Link href="/standards">Standards</Link>
          <Link href="/seller/apply">Sell with us</Link>

          {profile?.role === 'admin' && <Link href="/admin">Admin</Link>}
          {profile?.role === 'seller' && <Link href="/seller/dashboard">Dashboard</Link>}

          {profile ? (
            <Link href="/logout">Log out</Link>
          ) : (
            <Link href="/login">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
