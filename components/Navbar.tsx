import Link from 'next/link';
import Image from 'next/image';
import { createClient, getCurrentProfile, getCurrentMembership } from '@/lib/supabase/server';

export default async function Navbar() {
  const profile = await getCurrentProfile();
  const membership = profile ? await getCurrentMembership() : null;

  let cartCount = 0;
  if (profile) {
    const supabase = createClient();
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id);
    cartCount = count ?? 0;
  }

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
          <Link href={membership ? '/members' : '/community'}>Community</Link>
          <Link href="/seller/apply">Sell with us</Link>

          {profile?.role === 'admin' && <Link href="/admin">Admin</Link>}
          {profile?.role === 'seller' && <Link href="/seller/dashboard">Dashboard</Link>}

          {profile && (
            <Link href="/cart" className="relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-oxblood px-1.5 py-0.5 text-[10px] font-medium leading-none text-bone">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

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
