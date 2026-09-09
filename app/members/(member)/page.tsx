import Link from 'next/link';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';

export default async function MembersDashboardPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const [{ data: posts }, { data: meetups }] = await Promise.all([
    supabase
      .from('community_posts')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('meetups')
      .select('*')
      .eq('status', 'approved')
      .gte('event_at', new Date().toISOString())
      .order('event_at', { ascending: true })
      .limit(3),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}.</h1>
      <p className="mt-2 text-sm text-charcoal/70">Here's what's happening in the community.</p>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent in the feed</h2>
            <Link href="/members/feed" className="text-sm text-oxblood underline underline-offset-4">View all</Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {posts?.map((p: any) => (
              <div key={p.id} className="rounded-lg border border-charcoal/10 bg-white p-4 text-sm">
                <p className="text-charcoal/50">{p.profiles?.full_name ?? 'A member'}</p>
                <p className="mt-1 line-clamp-3">{p.body}</p>
              </div>
            ))}
            {!posts?.length && <p className="text-sm text-charcoal/60">No posts yet — be the first.</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Upcoming meetups</h2>
            <Link href="/members/meetups" className="text-sm text-oxblood underline underline-offset-4">View all</Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {meetups?.map((m) => (
              <div key={m.id} className="rounded-lg border border-charcoal/10 bg-white p-4 text-sm">
                <p className="font-medium">{m.title}</p>
                <p className="mt-1 text-charcoal/60">
                  {new Date(m.event_at).toLocaleString()} · {m.location}
                </p>
              </div>
            ))}
            {!meetups?.length && <p className="text-sm text-charcoal/60">No upcoming meetups yet — host one.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
