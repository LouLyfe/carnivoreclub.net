import Link from 'next/link';
import { getCurrentProfile, getCurrentMembership } from '@/lib/supabase/server';

export default async function CommunityPage() {
  const profile = await getCurrentProfile();
  const membership = profile ? await getCurrentMembership() : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-oxblood">Carnivore Club Community</p>
      <h1 className="mt-2 font-heading text-3xl md:text-4xl">A community that never has to look anywhere else.</h1>
      <p className="mt-4 text-base text-charcoal/70 md:text-lg">
        Membership gets you into the members-only discussion feed and lets you find — or host — local carnivore
        Meat Ups and dinners with other members near you.
      </p>

      <div className="mt-10 rounded-lg border border-charcoal/10 bg-white p-6">
        <h2 className="font-heading text-xl">What's included</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm text-charcoal/80">
          <li>
            <span className="font-medium">Members feed</span> — post questions, wins, and recommendations; other
            members reply.
          </li>
          <li>
            <span className="font-medium">Local Meat Ups &amp; dinners</span> — find one near you, or host your own
            (every Meat Up is reviewed before it's listed, same standard as our sellers and products).
          </li>
        </ul>

        <div className="mt-6 border-t border-charcoal/10 pt-6">
          {membership ? (
            <>
              <p className="text-sm text-charcoal/70">
                You're already a member{!membership.stripe_payment_intent_id ? ' (billing setup pending)' : ''}.
              </p>
              <Link
                href="/members"
                className="mt-3 inline-block rounded-md bg-oxblood px-6 py-3 text-sm font-medium text-bone hover:bg-oxblood/90"
              >
                Go to the members area
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-charcoal/70">
                Membership billing is still being set up — joining now reserves your spot and gives you access
                today, at no charge until that's live.
              </p>
              <Link
                href={profile ? '/members/join' : '/login?redirect=/members/join'}
                className="mt-3 inline-block rounded-md bg-oxblood px-6 py-3 text-sm font-medium text-bone hover:bg-oxblood/90"
              >
                Join the community
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
