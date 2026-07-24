import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { decideProduct, editProduct } from '../../actions';
import StatusBadge from '@/components/StatusBadge';
import Field from '@/components/form/Field';

const PILLARS = [
  { key: 'animal_raising', label: 'Animal raising standard meets published criteria' },
  { key: 'ingredient_purity', label: 'Ingredient purity / no undisclosed additives' },
  { key: 'cold_chain', label: 'Cold chain method is adequate for the product' },
  { key: 'labelling', label: 'Labelling is accurate and complete' },
  { key: 'shelf_life', label: 'Shelf life claim is supportable' },
];

const TIERS = [
  { value: 'approved', label: 'Approved' },
  { value: 'club_selection', label: 'Club Selection' },
  { value: 'founders_pick', label: "Founder's Pick" },
];

export default async function AdminProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('*, sellers(business_name)')
    .eq('id', params.id)
    .single();
  if (!product) notFound();

  const { data: categories } = await supabase.from('categories').select('*').order('name');

  const { data: history } = await supabase
    .from('approval_reviews')
    .select('*')
    .eq('target_type', 'product')
    .eq('target_id', params.id)
    .order('created_at', { ascending: false });

  const images: string[] = product.images ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-charcoal/60">{(product as any).sellers?.business_name}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>

      {images.length > 0 ? (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-md bg-charcoal/5">
              <Image src={url} alt="" fill sizes="150px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          No photos uploaded for this listing yet.
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-charcoal/60">Price</dt><dd>${(product.price_cents / 100).toFixed(2)}</dd>
        <dt className="text-charcoal/60">Animal raising standard</dt><dd>{product.animal_raising_standard ?? '—'}</dd>
        <dt className="text-charcoal/60">Ingredients</dt><dd>{product.ingredients_list ?? '—'}</dd>
        <dt className="text-charcoal/60">Cold chain method</dt><dd>{product.cold_chain_method ?? '—'}</dd>
        <dt className="text-charcoal/60">Shelf life</dt><dd>{product.shelf_life ?? '—'}</dd>
      </dl>
      {product.description && (
        <p className="mt-4 text-sm text-charcoal/70">{product.description}</p>
      )}

      <details className="mt-8 rounded-lg border border-charcoal/10 bg-white">
        <summary className="cursor-pointer px-6 py-4 text-sm font-medium">
          Edit listing details (fix a typo or swap a photo — doesn't change approval status)
        </summary>
        <form action={editProduct} encType="multipart/form-data" className="flex flex-col gap-4 border-t border-charcoal/10 p-6">
          <input type="hidden" name="product_id" value={product.id} />

          <Field label="Product name" name="name">
            <input id="name" name="name" defaultValue={product.name} className="rounded-md border border-charcoal/20 px-3 py-2" />
          </Field>

          {images.length > 0 && (
            <Field label="Current photos" name="existing_images">
              <div className="grid grid-cols-4 gap-2">
                {images.map((url) => (
                  <label key={url} className="block cursor-pointer">
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

          <Field label="Add photos on the seller's behalf" name="images">
            <input
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="rounded-md border border-charcoal/20 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-sm file:text-bone"
            />
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

          <Field label="Price (AUD)" name="price">
            <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={(product.price_cents / 100).toFixed(2)} className="rounded-md border border-charcoal/20 px-3 py-2" />
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

          <button type="submit" className="self-start rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-bone hover:bg-charcoal/90">
            Save corrections
          </button>
        </form>
      </details>

      <form action={decideProduct} className="mt-6 flex flex-col gap-4 rounded-lg border border-charcoal/10 bg-white p-6">
        <input type="hidden" name="product_id" value={product.id} />
        <h2 className="font-medium">Five-pillar checklist</h2>

        {PILLARS.map((p) => (
          <label key={p.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={`pillar_${p.key}`} className="h-4 w-4" />
            {p.label}
          </label>
        ))}

        <label className="mt-2 flex flex-col gap-1 text-sm">
          Tier (if approving)
          <select name="tier" className="rounded-md border border-charcoal/20 px-3 py-2">
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label className="mt-2 flex flex-col gap-1 text-sm">
          Notes
          <textarea name="notes" rows={3} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </label>

        <div className="mt-2 flex gap-3">
          <button name="decision" value="approved" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            Approve
          </button>
          <button name="decision" value="on_hold" className="rounded-md bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600">
            Put on hold
          </button>
          <button name="decision" value="rejected" className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
            Reject
          </button>
        </div>
      </form>

      {!!history?.length && (
        <>
          <h2 className="mt-10 text-lg font-medium">Review history</h2>
          <div className="mt-4 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
            {history.map((h) => (
              <div key={h.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <StatusBadge status={h.decision} />
                  <span className="text-charcoal/50">{new Date(h.created_at).toLocaleString()}</span>
                </div>
                {h.notes && <p className="mt-1 text-charcoal/70">{h.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
