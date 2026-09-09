import Link from 'next/link';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { updateCartItem, removeFromCart, placeOrder } from './actions';
import FormMessage from '@/components/FormMessage';
import SubmitButton from '@/components/form/SubmitButton';

export default async function CartPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: items } = await supabase
    .from('cart_items')
    .select('*, products(name, price_cents, images, status)')
    .eq('profile_id', profile!.id)
    .order('created_at', { ascending: true });

  const total_cents = (items ?? []).reduce(
    (sum: number, i: any) => sum + (i.products?.price_cents ?? 0) * i.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <FormMessage error={searchParams.error} />

      <div className="mt-8 flex flex-col gap-4">
        {items?.map((i: any) => (
          <div key={i.id} className="flex items-center gap-4 rounded-lg border border-charcoal/10 bg-white p-4">
            <div className="h-16 w-16 flex-shrink-0 rounded-md bg-charcoal/5" />
            <div className="flex-1">
              <p className="font-medium">{i.products?.name}</p>
              <p className="text-sm text-charcoal/60">${((i.products?.price_cents ?? 0) / 100).toFixed(2)} each</p>
              {i.products?.status !== 'approved' && (
                <p className="text-sm text-red-700">No longer available — won't be included in your order.</p>
              )}
            </div>
            <form action={updateCartItem} className="flex items-center gap-2">
              <input type="hidden" name="item_id" value={i.id} />
              <input
                name="quantity"
                type="number"
                min="1"
                defaultValue={i.quantity}
                className="w-16 rounded-md border border-charcoal/20 px-2 py-1 text-sm"
              />
              <button className="text-sm underline">Update</button>
            </form>
            <form action={removeFromCart}>
              <input type="hidden" name="item_id" value={i.id} />
              <button className="text-sm text-red-700 underline">Remove</button>
            </form>
          </div>
        ))}
        {!items?.length && (
          <p className="text-sm text-charcoal/60">
            Your cart is empty. <Link href="/shop" className="underline">Browse the shop</Link>.
          </p>
        )}
      </div>

      {!!items?.length && (
        <div className="mt-8 flex flex-col items-end gap-4 border-t border-charcoal/10 pt-6">
          <p className="text-lg font-medium">Total: ${(total_cents / 100).toFixed(2)}</p>
          <p className="text-sm text-charcoal/60">
            Payment isn't connected yet — placing an order records it as unpaid; we'll follow up once billing is live.
          </p>
          <form action={placeOrder}>
            <SubmitButton>Place order</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
