import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Carnivore Club</h1>
      <p className="mx-auto mt-4 max-w-xl text-charcoal/70">
        A marketplace of independently reviewed meat, organ, and tallow suppliers —
        every seller and every listing is checked against our compliance and
        quality standards before it goes live.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/shop" className="rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-bone hover:bg-charcoal/90">
          Browse the shop
        </Link>
        <Link href="/standards" className="rounded-md border border-charcoal/20 px-5 py-2.5 text-sm font-medium hover:border-charcoal/40">
          Our standards
        </Link>
      </div>
    </div>
  );
}
