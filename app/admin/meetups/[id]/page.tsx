import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { decideMeetup } from '../../actions';
import StatusBadge from '@/components/StatusBadge';

export default async function AdminMeetupDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: meetup } = await supabase
    .from('meetups')
    .select('*, profiles(full_name, email)')
    .eq('id', params.id)
    .single();
  if (!meetup) notFound();

  const { data: history } = await supabase
    .from('approval_reviews')
    .select('*')
    .eq('target_type', 'meetup')
    .eq('target_id', params.id)
    .order('created_at', { ascending: false });

  const host = (meetup as any).profiles;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{meetup.title}</h1>
        <StatusBadge status={meetup.status} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-charcoal/60">Host</dt><dd>{host?.full_name ?? host?.email ?? '—'}</dd>
        <dt className="text-charcoal/60">When</dt><dd>{new Date(meetup.event_at).toLocaleString()}</dd>
        <dt className="text-charcoal/60">Location</dt><dd>{meetup.location}</dd>
        <dt className="text-charcoal/60">Capacity</dt><dd>{meetup.capacity ?? '—'}</dd>
      </dl>
      {meetup.description && <p className="mt-4 text-sm text-charcoal/80">{meetup.description}</p>}

      {meetup.status === 'pending' && (
        <form action={decideMeetup} className="mt-10 flex flex-col gap-4 rounded-lg border border-charcoal/10 bg-white p-6">
          <input type="hidden" name="meetup_id" value={meetup.id} />
          <h2 className="font-medium">Review</h2>

          <label className="flex flex-col gap-1 text-sm">
            Notes
            <textarea name="notes" rows={3} className="rounded-md border border-charcoal/20 px-3 py-2" />
          </label>

          <div className="mt-2 flex gap-3">
            <button name="decision" value="approved" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              Approve
            </button>
            <button name="decision" value="rejected" className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
              Reject
            </button>
          </div>
        </form>
      )}

      {!!history?.length && (
        <>
          <h2 className="mt-10 text-lg font-medium">Review history</h2>
          <div className="mt-4 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
            {history.map((h) => (
              <div key={h.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <StatusBadge status={h.decision} />
                  <span className="text-charcoal/50">{new Date(h.created_at).toLocaleString()}</span>
                </div>
                {h.notes && <p className="mt-1 text-charcoal/70">{h.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
