'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/cart');
  return { supabase, userId: user!.id };
}

export async function addToCart(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const product_id = formData.get('product_id') as string;
  const quantity = Math.max(1, Number(formData.get('quantity')) || 1);
  const redirectTo = (formData.get('redirect_to') as string) || `/shop/product/${product_id}`;

  // One row per (profile, product) — bump quantity if it's already in the cart.
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('profile_id', userId)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
  } else {
    await supabase.from('cart_items').insert({ profile_id: userId, product_id, quantity });
  }

  revalidatePath('/cart');
  redirect(redirectTo + '?added=1');
}

export async function updateCartItem(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const item_id = formData.get('item_id') as string;
  const quantity = Math.max(1, Number(formData.get('quantity')) || 1);

  await supabase.from('cart_items').update({ quantity }).eq('id', item_id).eq('profile_id', userId);

  revalidatePath('/cart');
  redirect('/cart');
}

export async function removeFromCart(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const item_id = formData.get('item_id') as string;
  await supabase.from('cart_items').delete().eq('id', item_id).eq('profile_id', userId);

  revalidatePath('/cart');
  redirect('/cart');
}

export async function placeOrder() {
  const { supabase, userId } = await requireUser();

  const { data: items } = await supabase
    .from('cart_items')
    .select('*, products(price_cents, seller_id, status)')
    .eq('profile_id', userId);

  const validItems = (items ?? []).filter((i: any) => i.products?.status === 'approved');

  if (!validItems.length) {
    redirect('/cart?error=' + encodeURIComponent('Your cart is empty.'));
  }

  const total_cents = validItems.reduce((sum: number, i: any) => sum + i.products.price_cents * i.quantity, 0);

  // Stays 'pending' (unpaid) — Stripe isn't connected to this project yet.
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ buyer_id: userId, total_cents, status: 'pending' })
    .select('id')
    .single();

  if (orderError || !order) {
    redirect('/cart?error=' + encodeURIComponent(orderError?.message ?? 'Could not place order.'));
  }

  const orderItems = validItems.map((i: any) => ({
    order_id: order!.id,
    product_id: i.product_id,
    seller_id: i.products.seller_id,
    quantity: i.quantity,
    price_cents: i.products.price_cents, // snapshot at time of order
  }));

  await supabase.from('order_items').insert(orderItems);
  await supabase.from('cart_items').delete().eq('profile_id', userId);

  revalidatePath('/cart');
  redirect(`/orders/${order!.id}`);
}
