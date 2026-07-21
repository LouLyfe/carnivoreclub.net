'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Decision = 'approved' | 'on_hold' | 'rejected';

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  if (profile?.role !== 'admin') redirect('/');

  return { supabase, adminId: user!.id };
}

export async function decideSeller(formData: FormData) {
  const { supabase, adminId } = await requireAdmin();

  const sellerId = formData.get('seller_id') as string;
  const decision = formData.get('decision') as Decision;
  const notes = (formData.get('notes') as string) || null;

  // Five-pillar / compliance checklist scores, one checkbox per pillar.
  const pillar_scores = {
    business_registration: formData.get('pillar_business_registration') === 'on',
    food_licence: formData.get('pillar_food_licence') === 'on',
    insurance: formData.get('pillar_insurance') === 'on',
    identity_verification: formData.get('pillar_identity_verification') === 'on',
    references: formData.get('pillar_references') === 'on',
  };

  await supabase.from('sellers').update({ status: decision }).eq('id', sellerId);

  await supabase.from('approval_reviews').insert({
    target_type: 'seller',
    target_id: sellerId,
    reviewer_id: adminId,
    pillar_scores,
    decision,
    notes,
  });

  revalidatePath('/admin/sellers');
  redirect('/admin/sellers');
}

export async function decideProduct(formData: FormData) {
  const { supabase, adminId } = await requireAdmin();

  const productId = formData.get('product_id') as string;
  const decision = formData.get('decision') as Decision;
  const tier = (formData.get('tier') as string) || null;
  const notes = (formData.get('notes') as string) || null;

  const pillar_scores = {
    animal_raising: formData.get('pillar_animal_raising') === 'on',
    ingredient_purity: formData.get('pillar_ingredient_purity') === 'on',
    cold_chain: formData.get('pillar_cold_chain') === 'on',
    labelling: formData.get('pillar_labelling') === 'on',
    shelf_life: formData.get('pillar_shelf_life') === 'on',
  };

  await supabase
    .from('products')
    .update({ status: decision, tier: decision === 'approved' ? tier : null })
    .eq('id', productId);

  await supabase.from('approval_reviews').insert({
    target_type: 'product',
    target_id: productId,
    reviewer_id: adminId,
    pillar_scores,
    decision,
    notes,
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}
