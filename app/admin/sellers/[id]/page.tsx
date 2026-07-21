import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { decideSeller } from '../../actions';
import StatusBadge from '@/components/StatusBadge';
import SubmitButton from '@/components/form/SubmitButton';

const PILLARS = [
  { key: 'business_registration', label: 'Business registration (ABN) verified' },
  { key: 'food_licence', label: 'Food licence valid and current' },
  { key: 'insurance', label: 'Public liability insurance meets minimum coverage' },
  { key: 'identity_verification', label: 'Identity verification complete' },
  { key: 'references', label: 'References / track record checked' },
];

export default async function AdminSellerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: seller } = await supabase.from('sellers').select('*').eq('id', params.id).single();
  if (!seller) notFound();

  const { data: history } = await supabase
    .from('approval_reviews')
    .select('*')
    .eq('target_type', 'seller')
    .eq('target_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{seller.business_name}</h1>
        <StatusBadge status={seller.status} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-charcoal/60">ABN</dt><dd>{seller.abn}</dd>
        <dt className="text-charcoal/60">Food licence #</dt><dd>{seller.licence_number ?? '—'}</dd>
        <dt className="text-charcoal/60">Licence expiry</dt><dd>{seller.licence_expiry ?? '—'}</dd>
        <dt className="text-charcoal/60">Insurance provider</dt><dd>{seller.insurance_provider ?? '—'}</dd>
        <dt className="text-charcoal/60">Insurance policy #</dt><dd>{seller.insurance_policy_number ?? '—'}</dd>
        <dt className="text-charcoal/60">Insurance expiry</dt><dd>{seller.insurance_expiry ?? '—'}</dd>
      </dl>

      <form action={decideSeller} className="mt-10 flex flex-col gap-4 rounded-lg border border-charcoal/10 bg-white p-6">
        <input type="hidden" name="seller_id" value={seller.id} />
        <h2 className="font-medium">Compliance checklist</h2>

        {PILLARS.map((p) => (
          <label key={p.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={`pillar_${p.key}`} className="h-4 w-4" />
            {p.label}
          </label>
        ))}

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
