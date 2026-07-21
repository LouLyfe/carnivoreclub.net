import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';

export default async function AdminSellersPage() {
  const supabase = createClient();
  const { data: sellers } = await supabase
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Seller applications</h1>

      <div className="mt-8 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
        {sellers?.map((s) => (
          <Link
            key={s.id}
            href={`/admin/sellers/${s.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-charcoal/5"
          >
            <div>
              <p className="font-medium">{s.business_name}</p>
              <p className="text-sm text-charcoal/60">ABN {s.abn}</p>
            </div>
            <StatusBadge status={s.status} />
          </Link>
        ))}
        {!sellers?.length && <p className="px-4 py-6 text-sm text-charcoal/70">No applications yet.</p>}
      </div>
    </div>
  );
}
