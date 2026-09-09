import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminHomePage() {
  const supabase = createClient();

  const [{ count: pendingSellers }, { count: pendingProducts }, { count: pendingRecipes }, { count: pendingMeetups }] =
    await Promise.all([
      supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('recipes').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('meetups').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  const { data: expiring } = await supabase
    .from('sellers')
    .select('id, business_name, licence_expiry, insurance_expiry')
    .eq('status', 'approved')
    .or(`licence_expiry.lte.${soon.toISOString()},insurance_expiry.lte.${soon.toISOString()}`);

  const cards = [
    { label: 'Sellers awaiting review', count: pendingSellers ?? 0, href: '/admin/sellers' },
    { label: 'Products awaiting review', count: pendingProducts ?? 0, href: '/admin/products' },
    { label: 'Recipes awaiting review', count: pendingRecipes ?? 0, href: '/admin/recipes' },
    { label: 'Meetups awaiting review', count: pendingMeetups ?? 0, href: '/admin/meetups' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin — approval queue</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-charcoal/10 bg-white p-6 hover:border-oxblood/40"
          >
            <p className="text-3xl font-semibold">{c.count}</p>
            <p className="mt-1 text-sm text-charcoal/70">{c.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-medium">Licence / insurance expiring within 30 days</h2>
      {!expiring?.length ? (
        <p className="mt-4 text-sm text-charcoal/70">Nothing due soon.</p>
      ) : (
        <div className="mt-4 divide-y divide-charcoal/10 rounded-lg border border-charcoal/10 bg-white">
          {expiring.map((s) => (
            <div key={s.id} className="px-4 py-3 text-sm">
              <p className="font-medium">{s.business_name}</p>
              <p className="text-charcoal/60">
                Licence: {s.licence_expiry ?? '—'} · Insurance: {s.insurance_expiry ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
