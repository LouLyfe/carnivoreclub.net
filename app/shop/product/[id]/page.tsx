import { notFound } from 'next/navigation';
import Image from 'next/image';
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
  const images = product.images ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-charcoal/60">{category?.name}</p>
      <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-sm text-charcoal/60">Sold by {seller?.business_name}</p>

      {images.length ? (
        <div className="mt-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-charcoal/5">
            <Image src={images[0]} alt={product.name} fill sizes="768px" className="object-cover" priority />
          </div>
          {images.length > 1 && (
            <div className="mt-2 grid grid-cols-6 gap-2">
              {images.slice(1).map((url: string, i: number) => (
                <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-charcoal/5">
                  <Image src={url} alt={`${product.name} photo ${i + 2}`} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 aspect-video rounded-lg bg-charcoal/5" />
      )}

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
