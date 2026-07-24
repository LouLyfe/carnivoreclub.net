'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const MAX_IMAGES = 7;

export async function updateProduct(formData: FormData) {
  const supabase = createClient();
  const productId = formData.get('product_id') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/seller/dashboard');

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, status')
    .eq('profile_id', user!.id)
    .maybeSingle();

  if (!seller) redirect('/seller/dashboard');

  // Confirm this product actually belongs to this seller before touching it.
  const { data: existing } = await supabase
    .from('products')
    .select('id, seller_id, status, images')
    .eq('id', productId)
    .maybeSingle();

  if (!existing || existing.seller_id !== seller.id) {
    redirect('/seller/dashboard');
  }

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const priceDollars = parseFloat(formData.get('price') as string);
  const category_id = (formData.get('category_id') as string) || null;
  const animal_raising_standard = (formData.get('animal_raising_standard') as string) || null;
  const ingredients_list = (formData.get('ingredients_list') as string) || null;
  const cold_chain_method = (formData.get('cold_chain_method') as string) || null;
  const shelf_life = (formData.get('shelf_life') as string) || null;

  if (!name || Number.isNaN(priceDollars)) {
    redirect(`/seller/products/${productId}/edit?error=` + encodeURIComponent('Name and a valid price are required.'));
  }

  // Existing photos: any not explicitly checked "remove" are kept.
  const removeUrls = new Set(formData.getAll('remove_image'));
  const keptImages = (existing!.images ?? []).filter((url: string) => !removeUrls.has(url));

  // New uploads, appended up to the remaining slots.
  const remainingSlots = Math.max(0, MAX_IMAGES - keptImages.length);
  const newFiles = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, remainingSlots);

  const newUrls: string[] = [];
  for (const file of newFiles) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${seller!.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { contentType: file.type });
    if (!uploadError) {
      const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(path);
      newUrls.push(publicUrl.publicUrl);
    }
  }

  const images = [...keptImages, ...newUrls];

  // Editing an already-approved (or on-hold/rejected) listing sends it back
  // for admin review rather than silently changing something that's live —
  // keeps the "everything here has been checked" promise intact. Editing
  // while still pending_review just stays pending_review.
  const nextStatus = existing!.status === 'draft' ? 'draft' : 'pending_review';

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      price_cents: Math.round(priceDollars * 100),
      category_id,
      animal_raising_standard,
      ingredients_list,
      cold_chain_method,
      shelf_life,
      images,
      status: nextStatus,
      tier: nextStatus === 'pending_review' ? null : undefined,
    })
    .eq('id', productId);

  if (error) {
    redirect(`/seller/products/${productId}/edit?error=` + encodeURIComponent(error.message));
  }

  redirect('/seller/dashboard?success=' + encodeURIComponent(
    existing!.status === 'approved'
      ? 'Changes saved. This listing has been sent back for admin review before it goes live again.'
      : 'Changes saved.'
  ));
}
