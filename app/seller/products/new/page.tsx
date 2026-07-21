import { redirect } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { createProduct } from './actions';
import Field from '@/components/form/Field';
import SubmitButton from '@/components/form/SubmitButton';
import FormMessage from '@/components/FormMessage';

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?redirect=/seller/products/new');

  const supabase = createClient();

  const { data: seller } = await supabase
    .from('sellers')
    .select('id, status')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!seller || seller.status !== 'approved') redirect('/seller/dashboard');

  const { data: categories } = await supabase.from('categories').select('*').order('name');

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">New product</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Listings go live only after admin review against the five-pillar checklist.
      </p>

      <form action={createProduct} className="mt-8 flex flex-col gap-4">
        <Field label="Product name" name="name" required>
          <input id="name" name="name" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Category" name="category_id">
          <select id="category_id" name="category_id" className="rounded-md border border-charcoal/20 px-3 py-2">
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Description" name="description">
          <textarea id="description" name="description" rows={3} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Price (AUD)" name="price" required>
          <input id="price" name="price" type="number" step="0.01" min="0" required className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Animal raising standard" name="animal_raising_standard">
          <input id="animal_raising_standard" name="animal_raising_standard" placeholder="e.g. 100% grass-fed and finished" className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Ingredients list" name="ingredients_list">
          <textarea id="ingredients_list" name="ingredients_list" rows={2} className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Cold chain method" name="cold_chain_method">
          <input id="cold_chain_method" name="cold_chain_method" placeholder="e.g. Vacuum-sealed, frozen, shipped in insulated box" className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <Field label="Shelf life" name="shelf_life">
          <input id="shelf_life" name="shelf_life" placeholder="e.g. 12 months frozen" className="rounded-md border border-charcoal/20 px-3 py-2" />
        </Field>

        <FormMessage error={searchParams.error} />

        <SubmitButton>Submit for review</SubmitButton>
      </form>
    </div>
  );
}
