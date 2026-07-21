import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types/database';

const TIER_LABEL: Record<string, string> = {
  approved: 'Approved',
  club_selection: 'Club Selection',
  founders_pick: "Founder's Pick",
};

export default function ProductCard({ product }: { product: Product }) {
  const photo = product.images?.[0];

  return (
    <Link
      href={`/shop/product/${product.id}`}
      className="block rounded-lg border border-charcoal/10 bg-white p-4 transition hover:border-oxblood/40 hover:shadow-sm"
    >
      {photo ? (
        <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-charcoal/5">
          <Image src={photo} alt={product.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
        </div>
      ) : (
        <div className="mb-3 aspect-square rounded-md bg-charcoal/5" />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{product.name}</h3>
        {product.tier && (
          // Trust/tier signal — gold on charcoal per Brand Guidelines Section 5.
          <span className="whitespace-nowrap rounded-full border border-gold/40 bg-charcoal px-2 py-0.5 text-xs font-medium text-gold">
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
