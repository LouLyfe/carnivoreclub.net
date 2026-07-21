import Link from 'next/link';
import type { Product } from '@/lib/types/database';

const TIER_LABEL: Record<string, string> = {
  approved: 'Approved',
  club_selection: 'Club Selection',
  founders_pick: "Founder's Pick",
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/product/${product.id}`}
      className="block rounded-lg border border-charcoal/10 bg-white p-4 transition hover:border-ember/40 hover:shadow-sm"
    >
      <div className="mb-3 aspect-square rounded-md bg-charcoal/5" />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{product.name}</h3>
        {product.tier && (
          <span className="whitespace-nowrap rounded-full bg-ember/10 px-2 py-0.5 text-xs font-medium text-ember">
            {TIER_LABEL[product.tier]}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-charcoal/70">
        ${(product.price_cents / 100).toFixed(2)}
      </p>
    </Link>
  );
}
