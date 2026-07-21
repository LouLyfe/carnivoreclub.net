'use client';

import { useEffect, useRef } from 'react';

export default function LogoutForm({ action }: { action: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action}>
      <noscript>
        <button type="submit" className="mt-4 underline">Click here to log out</button>
      </noscript>
    </form>
  );
}
