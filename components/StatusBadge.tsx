const STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  pending_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-slate-200 text-slate-700',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-emerald-100 text-emerald-800',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
