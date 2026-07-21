import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { decideProduct } from '../../actions';
import StatusBadge from '@/components/StatusBadge';

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

  const { data: history } = await supabase
    .from('approval_reviews')
    .select('*')
    .eq('target_type', 'product')
    .eq('target_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-charcoal/60">{(product as any).sellers?.business_name}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>

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

      <form action={decideProduct} className="mt-10 flex flex-col gap-4 rounded-lg border border-charcoal/10 bg-white p-6">
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
