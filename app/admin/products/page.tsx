import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, sellers(business_name)')
    .order('created_at', { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Product listings</h1>

      <div className="mt-8 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
        {products?.map((p: any) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-charcoal/5"
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-charcoal/60">{p.sellers?.business_name} · ${(p.price_cents / 100).toFixed(2)}</p>
            </div>
            <StatusBadge status={p.status} />
          </Link>
        ))}
        {!products?.length && <p className="px-4 py-6 text-sm text-charcoal/70">No products yet.</p>}
      </div>
    </div>
  );
}
