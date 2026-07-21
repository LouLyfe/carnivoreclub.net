import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, sellers(business_name), categories(name)')
    .eq('id', params.id)
    .eq('status', 'approved')
    .maybeSingle();

  if (!product) notFound();

  const seller = (product as any).sellers;
  const category = (product as any).categories;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-charcoal/60">{category?.name}</p>
      <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-sm text-charcoal/60">Sold by {seller?.business_name}</p>

      <div className="mt-6 aspect-video rounded-lg bg-charcoal/5" />

      <p className="mt-6 text-xl font-medium">${(product.price_cents / 100).toFixed(2)}</p>
      {product.description && <p className="mt-4 text-charcoal/80">{product.description}</p>}

      <dl className="mt-8 grid grid-cols-1 gap-y-3 border-t border-charcoal/10 pt-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-charcoal/60">Animal raising standard</dt>
          <dd>{product.animal_raising_standard ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-charcoal/60">Ingredients</dt>
          <dd>{product.ingredients_list ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-charcoal/60">Cold chain method</dt>
          <dd>{product.cold_chain_method ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-charcoal/60">Shelf life</dt>
          <dd>{product.shelf_life ?? '—'}</dd>
        </div>
      </dl>

      <p className="mt-8 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
        Cart and checkout ship in Phase B.
      </p>
    </div>
  );
}
