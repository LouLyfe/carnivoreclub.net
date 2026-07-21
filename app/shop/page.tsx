import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';

export default async function ShopPage() {
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Shop</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className="rounded-full border border-charcoal/20 px-3 py-1 text-sm hover:border-ember/40"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {!products?.length ? (
        <p className="mt-10 text-sm text-charcoal/70">No products listed yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
