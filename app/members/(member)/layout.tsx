import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentMembership } from '@/lib/supabase/server';

export default async function MemberAreaLayout({ children }: { children: React.ReactNode }) {
  // MembersLayout (one level up) already guarantees a signed-in profile.
  const membership = await getCurrentMembership();
  if (!membership) redirect('/members/join');

  return (
    <div>
      <div className="border-b border-charcoal/10 bg-white">
        <nav className="mx-auto flex max-w-4xl gap-6 px-6 py-3 text-sm">
          <Link href="/members" className="font-medium hover:text-oxblood">Dashboard</Link>
          <Link href="/members/feed" className="font-medium hover:text-oxblood">Feed</Link>
          <Link href="/members/meetups" className="font-medium hover:text-oxblood">Meetups</Link>
        </nav>
      </div>
      {membership.status === 'pending_payment' && (
        <div className="bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
          Membership billing isn't live yet — you have full access while that's being set up.
        </div>
      )}
      {children}
    </div>
  );
}
