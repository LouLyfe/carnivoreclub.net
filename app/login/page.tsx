import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Field from '@/components/form/Field';
import SubmitButton from '@/components/form/SubmitButton';
import FormMessage from '@/components/FormMessage';

async function login(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string) || '/';

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(redirectTo);
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string };
}) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <form action={login} className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="redirect" value={searchParams.redirect ?? '/'} />

        <Field label="Email" name="email" required>
          <input id="email" name="email" type="email" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Password" name="password" required>
          <input id="password" name="password" type="password" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <FormMessage error={searchParams.error} />

        <SubmitButton>Log in</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-charcoal/70">
        No account? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </div>
  );
}
