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

const MAX_PRODUCT_IMAGES = 7;

// Lets an admin correct a listing directly (e.g. a seller's spelling
// mistake) without a full reject → resubmit → re-review cycle. Unlike a
// seller's own edit, this does NOT change the product's status — the
// admin making the correction is itself the review.
export async function editProduct(formData: FormData) {
  const { supabase } = await requireAdmin();

  const productId = formData.get('product_id') as string;

  const { data: existing } = await supabase
    .from('products')
    .select('id, images')
    .eq('id', productId)
    .maybeSingle();

  if (!existing) redirect('/admin/products');

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const priceDollars = parseFloat(formData.get('price') as string);
  const category_id = (formData.get('category_id') as string) || null;
  const animal_raising_standard = (formData.get('animal_raising_standard') as string) || null;
  const ingredients_list = (formData.get('ingredients_list') as string) || null;
  const cold_chain_method = (formData.get('cold_chain_method') as string) || null;
  const shelf_life = (formData.get('shelf_life') as string) || null;

  const removeUrls = new Set(formData.getAll('remove_image'));
  const keptImages = (existing.images ?? []).filter((url: string) => !removeUrls.has(url));

  const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - keptImages.length);
  const newFiles = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, remainingSlots);

  const newUrls: string[] = [];
  for (const file of newFiles) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${existing.id}/admin-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type });
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(publicUrl.publicUrl);
    }
  }

  const update: Record<string, unknown> = {
    category_id,
    animal_raising_standard,
    ingredients_list,
    cold_chain_method,
    shelf_life,
    images: [...keptImages, ...newUrls],
  };
  if (name) update.name = name;
  if (!Number.isNaN(priceDollars)) update.price_cents = Math.round(priceDollars * 100);
  update.description = description;

  await supabase.from('products').update(update).eq('id', productId);

  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}`);
}
