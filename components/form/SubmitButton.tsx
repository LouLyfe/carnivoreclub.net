'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-bone transition hover:bg-charcoal/90 disabled:opacity-50"
    >
      {pending ? 'Submitting…' : children}
    </button>
  );
}
