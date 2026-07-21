'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createProduct(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/seller/products/new');

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, status')
    .eq('profile_id', user!.id)
    .maybeSingle();

  if (!seller || seller.status !== 'approved') {
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
    redirect('/seller/products/new?error=' + encodeURIComponent('Name and a valid price are required.'));
  }

  const { error } = await supabase.from('products').insert({
    seller_id: seller!.id,
    category_id,
    name,
    description,
    price_cents: Math.round(priceDollars * 100),
    animal_raising_standard,
    ingredients_list,
    cold_chain_method,
    shelf_life,
    status: 'pending_review',
  });

  if (error) {
    redirect('/seller/products/new?error=' + encodeURIComponent(error.message));
  }

  redirect('/seller/dashboard');
}
