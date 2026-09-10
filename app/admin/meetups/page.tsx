import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';

export default async function AdminMeetupsPage() {
  const supabase = createClient();
  const { data: meetups } = await supabase
    .from('meetups')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Meat Ups &amp; dinners</h1>

      <div className="mt-8 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
        {meetups?.map((m) => (
          <Link
            key={m.id}
            href={`/admin/meetups/${m.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-charcoal/5"
          >
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-charcoal/60">
                {new Date(m.event_at).toLocaleString()} · {m.location}
              </p>
            </div>
            <StatusBadge status={m.status} />
          </Link>
        ))}
        {!meetups?.length && <p className="px-4 py-6 text-sm text-charcoal/70">No Meat Ups submitted yet.</p>}
      </div>
    </div>
  );
}
