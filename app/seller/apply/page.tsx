import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { applyAsSeller } from './actions';
import Field from '@/components/form/Field';
import SubmitButton from '@/components/form/SubmitButton';
import FormMessage from '@/components/FormMessage';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default async function SellerApplyPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  const profile = await getCurrentProfile();

  // If this profile already has a seller application, show its status
  // instead of the form.
  let existing = null;
  if (profile) {
    const supabase = createClient();
    const { data } = await supabase
      .from('sellers')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();
    existing = data;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Sell on Carnivore Club</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Every seller goes through our compliance review before listing products.
        You'll need your ABN, food licence details, and public liability insurance
        details on hand.
      </p>

      {existing ? (
        <div className="mt-8 rounded-lg border border-charcoal/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{existing.business_name}</h2>
            <StatusBadge status={existing.status} />
          </div>
          <p className="mt-2 text-sm text-charcoal/70">
            {existing.status === 'pending' &&
              "Your application is in the review queue. We'll email you once it's been assessed."}
            {existing.status === 'approved' &&
              'Your application has been approved.'}
            {existing.status === 'on_hold' &&
              'Your application is on hold — check your email for next steps.'}
            {existing.status === 'rejected' &&
              'Your application was not approved this time.'}
          </p>
          {existing.status === 'approved' && (
            <Link href="/seller/dashboard" className="mt-4 inline-block text-sm underline">
              Go to your seller dashboard
            </Link>
          )}
        </div>
      ) : (
        <form action={applyAsSeller} className="mt-8 flex flex-col gap-4">
          {!profile && (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              You'll need to <Link href="/signup" className="underline">create an account</Link> (or{' '}
              <Link href="/login?redirect=/seller/apply" className="underline">log in</Link>) to submit an application.
            </p>
          )}

          <Field label="Business name" name="business_name" required>
            <input id="business_name" name="business_name" required className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="ABN" name="abn" required>
            <input id="abn" name="abn" required className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="Food licence number" name="licence_number">
            <input id="licence_number" name="licence_number" className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="Food licence expiry" name="licence_expiry">
            <input id="licence_expiry" name="licence_expiry" type="date" className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="Insurance provider" name="insurance_provider">
            <input id="insurance_provider" name="insurance_provider" className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="Insurance policy number" name="insurance_policy_number">
            <input id="insurance_policy_number" name="insurance_policy_number" className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <Field label="Insurance expiry" name="insurance_expiry">
            <input id="insurance_expiry" name="insurance_expiry" type="date" className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          <FormMessage error={searchParams.error} success={searchParams.success} />

          <SubmitButton>Submit application</SubmitButton>
        </form>
      )}
    </div>
  );
}
