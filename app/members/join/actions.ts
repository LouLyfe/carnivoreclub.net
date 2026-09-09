'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function joinMembership() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/members/join');
  }

  // Idempotent — profile_id is unique, so this is a no-op if they already
  // have a membership row (e.g. double-submit).
  const { error } = await supabase
    .from('memberships')
    .upsert({ profile_id: user!.id, status: 'pending_payment' }, { onConflict: 'profile_id' });

  if (error) {
    redirect('/members/join?error=' + encodeURIComponent(error.message));
  }

  redirect('/members');
}
