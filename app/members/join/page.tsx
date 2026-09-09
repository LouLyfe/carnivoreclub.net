import { getCurrentMembership } from '@/lib/supabase/server';
import { joinMembership } from './actions';
import FormMessage from '@/components/FormMessage';
import SubmitButton from '@/components/form/SubmitButton';
import Link from 'next/link';

export default async function JoinMembershipPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const membership = await getCurrentMembership();

  if (membership) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-charcoal/70">You're already a member.</p>
        <Link href="/members" className="mt-4 inline-block text-sm underline">
          Go to the members area
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Join the Carnivore Club community</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Get access to the members feed and local meetups &amp; dinners. Membership billing isn't connected yet —
        joining now gives you full access at no charge until it is.
      </p>

      <form action={joinMembership} className="mt-8 flex flex-col gap-4">
        <FormMessage error={searchParams.error} />
        <SubmitButton>Join the community</SubmitButton>
      </form>
    </div>
  );
}
