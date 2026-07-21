'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function applyAsSeller(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/seller/apply');
  }

  const business_name = formData.get('business_name') as string;
  const abn = formData.get('abn') as string;
  const licence_number = (formData.get('licence_number') as string) || null;
  const licence_expiry = (formData.get('licence_expiry') as string) || null;
  const insurance_provider = (formData.get('insurance_provider') as string) || null;
  const insurance_policy_number = (formData.get('insurance_policy_number') as string) || null;
  const insurance_expiry = (formData.get('insurance_expiry') as string) || null;

  if (!business_name || !abn) {
    redirect('/seller/apply?error=' + encodeURIComponent('Business name and ABN are required.'));
  }

  // NOTE: minimum insurance coverage threshold is an open decision
  // (SITE_ARCHITECTURE.md Section 6) — enforce it here once confirmed,
  // e.g. by adding a coverage_amount field and validating it against
  // the Seller Approval Toolkit's minimum.

  const { error } = await supabase.from('sellers').insert({
    profile_id: user!.id,
    business_name,
    abn,
    licence_number,
    licence_expiry,
    insurance_provider,
    insurance_policy_number,
    insurance_expiry,
    status: 'pending',
  });

  if (error) {
    redirect('/seller/apply?error=' + encodeURIComponent(error.message));
  }

  redirect('/seller/apply?success=' + encodeURIComponent(
    "Application received. We'll review it against our compliance checklist and email you a decision."
  ));
}
