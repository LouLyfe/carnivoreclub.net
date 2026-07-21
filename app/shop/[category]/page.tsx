import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';

export default async function ShopCategoryPage({ params }: { params: { category: string } }) {
  const supabase = createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.category)
    .maybeSingle();

  if (!category) notFound();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'approved')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      {!products?.length ? (
        <p className="mt-10 text-sm text-charcoal/70">No products in this category yet.</p>
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
