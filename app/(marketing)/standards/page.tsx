export default function StandardsPage() {
  const pillars = [
    { title: 'Animal raising standard', body: 'Every product discloses how the animal was raised — grass-fed, pasture-raised, and finishing method are verified before approval.' },
    { title: 'Ingredient purity', body: 'No undisclosed additives, fillers, or preservatives. What’s on the label is what’s in the pack.' },
    { title: 'Cold chain integrity', body: 'Sellers document how products stay cold from processing to your door.' },
    { title: 'Accurate labelling', body: 'Product names, cuts, and weights match what ships.' },
    { title: 'Verifiable shelf life', body: 'Shelf life claims are checked against the storage and packaging method used.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Our standards</h1>
      <p className="mt-2 text-sm text-charcoal/70">
        Every seller and every product on Carnivore Club passes a review against
        the five pillars below before it's listed.
      </p>

      <div className="mt-8 space-y-6">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-lg border border-charcoal/10 bg-white p-5">
            <h2 className="font-medium">{p.title}</h2>
            <p className="mt-1 text-sm text-charcoal/70">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
