import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Field from '@/components/form/Field';
import SubmitButton from '@/components/form/SubmitButton';
import FormMessage from '@/components/FormMessage';

async function signup(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/signup?success=Check your email to confirm your account.');
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <form action={signup} className="mt-8 flex flex-col gap-4">
        <Field label="Full name" name="full_name" required>
          <input id="full_name" name="full_name" type="text" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Email" name="email" required>
          <input id="email" name="email" type="email" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Password" name="password" required>
          <input id="password" name="password" type="password" required minLength={8} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <FormMessage error={searchParams.error} success={searchParams.success} />

        <SubmitButton>Sign up</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-charcoal/70">
        Already have an account? <Link href="/login" className="underline">Log in</Link>
      </p>

      <p className="mt-2 text-sm text-charcoal/70">
        Want to sell on Carnivore Club? <Link href="/seller/apply" className="underline">Apply here</Link>.
      </p>
    </div>
  );
}
