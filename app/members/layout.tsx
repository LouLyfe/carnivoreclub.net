import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/supabase/server';

// Applies to everything under /members, including /members/join — so this
// only requires being signed in. The deeper "has a membership row" check
// lives in app/members/(member)/layout.tsx, which wraps everything *except*
// /join (redirecting there would otherwise loop back on itself).
export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/members');

  return <>{children}</>;
}
