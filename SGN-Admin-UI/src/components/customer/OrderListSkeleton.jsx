export default function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-shop border border-brand-border bg-white p-5 shadow-shop"
        >
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-6 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
