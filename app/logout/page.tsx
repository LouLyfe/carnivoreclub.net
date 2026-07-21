// Signing out mutates the auth cookie, which Next.js only allows inside a
// Server Action or Route Handler (not during a Server Component render).
// This page defines a server action and auto-submits it on load, so
// visiting /logout signs the user out immediately with no extra click.
import LogoutForm from './LogoutForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function performLogout() {
  'use server';
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export default function LogoutPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <p className="text-sm text-charcoal/70">Logging out…</p>
      <LogoutForm action={performLogout} />
    </div>
  );
}
