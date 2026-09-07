import Link from 'next/link';
import Image from 'next/image';

const HERO_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ah1q0gKm81u5hmbamyNGMsLZHW/hf_20260721_054728_8e1e9663-678e-4dfb-806a-2e9efaa62865.png';

const CATEGORIES = [
  {
    name: 'Beef & Red Meat',
    slug: 'beef',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ah1q0gKm81u5hmbamyNGMsLZHW/hf_20260721_054734_d6b0752e-eb24-44ca-8aef-e60f5457ac1c.png',
  },
  {
    name: 'Organ Meats & Offal',
    slug: 'organ-meats',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ah1q0gKm81u5hmbamyNGMsLZHW/hf_20260721_054735_c6572fcc-772e-4b46-8bbf-cb57427d2095.png',
  },
  {
    name: 'Tallow & Cooking Fats',
    slug: 'tallow',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ah1q0gKm81u5hmbamyNGMsLZHW/hf_20260721_054737_6052282a-6ad2-4e45-a962-19156fad3053.png',
  },
  {
    name: 'Bone Broth & Stock',
    slug: 'bone-broth',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3Ah1q0gKm81u5hmbamyNGMsLZHW/hf_20260721_054738_e3a7aa7f-c756-4679-be20-5aaa3e4855e5.png',
  },
];

const PILLARS = [
  { title: 'Animal Raising Standard', body: 'Grass-fed & finished, pasture-raised, or wild-caught — feedlot-finished or routine antibiotic/hormone use is an automatic reject.' },
  { title: 'Ingredient & Additive Purity', body: 'Single-ingredient where possible. Any seed oil, added sugar, or synthetic additive is an automatic reject.' },
  { title: 'Processing & Handling', body: 'Licensed facility, documented cold-chain from farm to dispatch, no red flags on hygiene.' },
  { title: 'Sourcing Transparency', body: 'Full traceability to farm or origin, on request. Anonymous or unverifiable sourcing is an automatic reject.' },
  { title: 'Compliance & Documentation', body: 'Valid food business licence and product liability insurance on file before a listing ever goes live.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/75 to-oxblood/85" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center text-bone">
          <p className="font-heading text-2xl font-medium uppercase tracking-[0.12em] text-gold sm:text-3xl">100% animal-based. Not keto, not paleo — carnivore.</p>
          <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
            The only marketplace where every product has already been through our approval process.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-bone/80">
            So you don't have to read another label. Every seller and every listing on Carnivore Club is checked against a published five-pillar standard before it ever goes live.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="rounded-md bg-oxblood px-6 py-3 text-sm font-medium text-bone hover:bg-oxblood/90">
              Browse the shop
            </Link>
            <Link href="/standards" className="rounded-md border border-bone/40 px-6 py-3 text-sm font-medium text-bone hover:border-bone">
              See our standards
            </Link>
          </div>
        </div>
      </section>

      {/* Founder story video */}
      <section className="bg-charcoal py-20 text-bone">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-2xl">This is what food alone can do.</h2>
          <p className="mt-3 text-bone/70">
            Real food. Rigorously approved. A community that never has to look anywhere else.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-4xl px-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <video className="h-full w-full object-cover" controls playsInline preload="metadata">
              <source src="/videos/founder-story.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-3 text-center text-xs text-bone/50">Individual results may vary. Not medical advice.</p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/standards" className="text-sm text-gold underline underline-offset-4">
            See what&apos;s approved →
          </Link>
        </div>
      </section>

      {/* Differentiator */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-heading text-2xl">Not selection. It's rejection.</h2>
        <p className="mt-4 text-charcoal/70">
          Endless choice is easy to find — Amazon, Instagram, and every farmers'-market directory already give you that.
          What's missing is a trusted filter. Carnivore Club's job is to do the rejecting, so if it's on the site, it has
          already passed the test.
        </p>
      </section>

      {/* Five pillars */}
      <section className="bg-charcoal py-20 text-bone">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading text-center text-2xl">Every listing clears five pillars — no exceptions</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="rounded-lg border border-bone/10 p-5">
                <p className="font-heading text-gold">{i + 1}</p>
                <h3 className="mt-2 text-sm font-medium">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-bone/60">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/standards" className="text-sm text-gold underline underline-offset-4">
              Read the full standard
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="font-heading text-center text-2xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-charcoal/5">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <p className="mt-2 text-sm font-medium">{c.name}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/shop" className="text-sm text-oxblood underline underline-offset-4">
            View all categories
          </Link>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-t border-charcoal/10 bg-bone py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-2xl">A trust shortcut, right on every listing</h2>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <span className="rounded-full border border-gold/40 bg-charcoal px-4 py-1.5 text-sm font-medium text-gold">Approved</span>
            <span className="rounded-full border border-gold/40 bg-charcoal px-4 py-1.5 text-sm font-medium text-gold">Club Selection</span>
            <span className="rounded-full border border-gold/40 bg-charcoal px-4 py-1.5 text-sm font-medium text-gold">Founder's Pick</span>
          </div>
          <p className="mx-auto mt-6 max-w-lg text-sm text-charcoal/70">
            Approved means it cleared all five pillars. Club Selection marks exceptional traceability and quality.
            Founder's Pick is reserved for a small number of products personally vouched for — used sparingly, so it stays meaningful.
          </p>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="bg-oxblood py-16 text-center text-bone">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-heading text-2xl">Producing something that belongs here?</h2>
          <p className="mt-3 text-bone/80">
            Regenerative farms, tallow renderers, organ-meat specialists, bone broth makers — if it's genuinely
            carnivore and you can back it up, we want to hear from you.
          </p>
          <Link href="/seller/apply" className="mt-6 inline-block rounded-md bg-bone px-6 py-3 text-sm font-medium text-oxblood hover:bg-bone/90">
            Apply to sell
          </Link>
        </div>
      </section>
    </div>
  );
}
