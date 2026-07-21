export default function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return (
    <p className={`text-sm ${error ? 'text-red-700' : 'text-emerald-700'}`}>
      {error ?? success}
    </p>
  );
}
