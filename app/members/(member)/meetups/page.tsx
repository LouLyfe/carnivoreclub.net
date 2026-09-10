import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { hostMeetup, rsvpMeetup, cancelRsvp } from './actions';
import FormMessage from '@/components/FormMessage';
import SubmitButton from '@/components/form/SubmitButton';
import StatusBadge from '@/components/StatusBadge';

export default async function MembersMeetupsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const [{ data: meetups }, { data: myRsvps }, { data: myHosted }] = await Promise.all([
    supabase.from('meetups').select('*').eq('status', 'approved').order('event_at', { ascending: true }),
    supabase.from('meetup_rsvps').select('meetup_id').eq('profile_id', profile!.id),
    supabase
      .from('meetups')
      .select('*')
      .eq('host_id', profile!.id)
      .neq('status', 'approved')
      .order('created_at', { ascending: false }),
  ]);

  const rsvpedIds = new Set((myRsvps ?? []).map((r) => r.meetup_id));

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Local Meat Ups &amp; dinners</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Find one near you, or host your own — every Meat Up goes through a quick review before it's listed.
      </p>

      <FormMessage error={searchParams.error} success={searchParams.success} />

      <div className="mt-8 flex flex-col gap-3">
        {meetups?.map((m) => (
          <div key={m.id} className="rounded-lg border border-charcoal/10 bg-white p-5">
            <p className="font-medium">{m.title}</p>
            <p className="mt-1 text-sm text-charcoal/60">
              {new Date(m.event_at).toLocaleString()} · {m.location}
              {m.capacity ? ` · capacity ${m.capacity}` : ''}
            </p>
            {m.description && <p className="mt-2 text-sm text-charcoal/80">{m.description}</p>}

            <form action={rsvpedIds.has(m.id) ? cancelRsvp : rsvpMeetup} className="mt-3">
              <input type="hidden" name="meetup_id" value={m.id} />
              <button
                className={
                  rsvpedIds.has(m.id)
                    ? 'rounded-md border border-charcoal/20 px-4 py-1.5 text-sm hover:bg-charcoal/5'
                    : 'rounded-md bg-oxblood px-4 py-1.5 text-sm font-medium text-bone hover:bg-oxblood/90'
                }
              >
                {rsvpedIds.has(m.id) ? "You're going — cancel RSVP" : 'RSVP'}
              </button>
            </form>
          </div>
        ))}
        {!meetups?.length && <p className="text-sm text-charcoal/60">No upcoming Meat Ups yet — host the first one below.</p>}
      </div>

      {!!myHosted?.length && (
        <div className="mt-10">
          <h2 className="font-medium">Your submitted Meat Ups</h2>
          <div className="mt-3 flex flex-col gap-2">
            {myHosted.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-charcoal/10 bg-white px-4 py-3 text-sm">
                <span>{m.title}</span>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-lg border border-charcoal/10 bg-white p-5">
        <h2 className="font-medium">Host a Meat Up</h2>
        <form action={hostMeetup} className="mt-4 flex flex-col gap-3">
          <input name="title" required placeholder="Title" className="rounded-md border border-charcoal/20 px-3 py-2 text-sm" />
          <input name="location" required placeholder="Location" className="rounded-md border border-charcoal/20 px-3 py-2 text-sm" />
          <input name="event_at" required type="datetime-local" className="rounded-md border border-charcoal/20 px-3 py-2 text-sm" />
          <input name="capacity" type="number" min="1" placeholder="Capacity (optional)" className="rounded-md border border-charcoal/20 px-3 py-2 text-sm" />
          <textarea name="description" rows={3} placeholder="Description (optional)" className="rounded-md border border-charcoal/20 px-3 py-2 text-sm" />
          <div>
            <SubmitButton>Submit for review</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
