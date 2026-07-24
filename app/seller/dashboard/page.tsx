import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';

export default async function SellerDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/seller/dashboard');

  const supabase = createClient();

  const { data: seller } = await supabase
    .from('sellers')
    .select('*')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!seller) redirect('/seller/apply');

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', seller.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{seller.business_name}</h1>
          <div className="mt-2"><StatusBadge status={seller.status} /></div>
        </div>

        {seller.status === 'approved' && (
          <Link
            href="/seller/products/new"
            className="rounded-md bg-oxblood px-4 py-2 text-sm font-medium text-bone hover:bg-oxblood/90"
          >
            + New product
          </Link>
        )}
      </div>

      {seller.status !== 'approved' && (
        <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          You can list products once your seller application is approved.
        </p>
      )}

      <h2 className="mt-10 text-lg font-medium">Your listings</h2>

      {!products?.length ? (
        <p className="mt-4 text-sm text-charcoal/70">No products yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-charcoal/60">${(p.price_cents / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <Link href={`/seller/products/${p.id}/edit`} className="text-sm text-oxblood underline underline-offset-4">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
