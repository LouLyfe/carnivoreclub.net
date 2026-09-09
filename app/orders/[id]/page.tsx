import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order } = await supabase.from('orders').select('*').eq('id', params.id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase
    .from('order_items')
    .select('*, products(name)')
    .eq('order_id', params.id);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Order placed</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Thanks — your order is recorded as <span className="font-medium">unpaid</span> for now. Payment isn't
        connected to the site yet; we'll be in touch once billing is live.
      </p>

      <div className="mt-8 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
        {items?.map((i: any) => (
          <div key={i.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{i.products?.name} × {i.quantity}</span>
            <span>${((i.price_cents * i.quantity) / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-right text-lg font-medium">Total: ${(order.total_cents / 100).toFixed(2)}</p>

      <Link href="/shop" className="mt-8 inline-block text-sm underline">Continue shopping</Link>
    </div>
  );
}
