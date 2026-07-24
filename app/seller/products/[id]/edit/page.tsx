import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { updateProduct } from './actions';
import Field from '@/components/form/Field';
import SubmitButton from '@/components/form/SubmitButton';
import FormMessage from '@/components/FormMessage';
import StatusBadge from '@/components/StatusBadge';

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?redirect=/seller/products/${params.id}/edit`);

  const supabase = createClient();

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, status')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!seller) redirect('/seller/dashboard');

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!product || product.seller_id !== seller.id) notFound();

  const { data: categories } = await supabase.from('categories').select('*').order('name');
  const images: string[] = product.images ?? [];

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <StatusBadge status={product.status} />
      </div>

      {product.status === 'approved' && (
        <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          This listing is currently live. Saving changes will send it back for admin review before it's visible in the shop again.
        </p>
      )}

      <form action={updateProduct} encType="multipart/form-data" className="mt-8 flex flex-col gap-4">
        <input type="hidden" name="product_id" value={product.id} />

        <Field label="Product name" name="name" required>
          <input id="name" name="name" defaultValue={product.name} required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        {images.length > 0 && (
          <Field label="Current photos" name="existing_images">
            <div className="grid grid-cols-4 gap-2">
              {images.map((url) => (
                <label key={url} className="group relative block cursor-pointer">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-charcoal/5">
                    <Image src={url} alt="" fill sizes="100px" className="object-cover" />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-charcoal/70">
                    <input type="checkbox" name="remove_image" value={url} className="h-3.5 w-3.5" />
                    Remove
                  </div>
                </label>
              ))}
            </div>
          </Field>
        )}

        <Field label={`Add more photos (up to ${7 - images.length} more)`} name="images">
          <input
            id="images"
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={images.length >= 7}
            className="rounded-md border border-charcoal/20 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-sm file:text-bone disabled:opacity-50"
          />
          <span className="text-xs text-charcoal/60">JPG, PNG, WEBP or GIF, up to 5MB each. 7 photos total, including any kept above.</span>
        </Field>

        <Field label="Category" name="category_id">
          <select id="category_id" name="category_id" defaultValue={product.category_id ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2">
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Description" name="description">
          <textarea id="description" name="description" rows={3} defaultValue={product.description ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Price (AUD)" name="price" required>
          <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={(product.price_cents / 100).toFixed(2)} required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Animal raising standard" name="animal_raising_standard">
          <input id="animal_raising_standard" name="animal_raising_standard" defaultValue={product.animal_raising_standard ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Ingredients list" name="ingredients_list">
          <textarea id="ingredients_list" name="ingredients_list" rows={2} defaultValue={product.ingredients_list ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Cold chain method" name="cold_chain_method">
          <input id="cold_chain_method" name="cold_chain_method" defaultValue={product.cold_chain_method ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Shelf life" name="shelf_life">
          <input id="shelf_life" name="shelf_life" defaultValue={product.shelf_life ?? ''} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <FormMessage error={searchParams.error} />

        <SubmitButton>Save changes</SubmitButton>
      </form>
    </div>
  );
}
