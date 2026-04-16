export default function PlantGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-shop border border-brand-border bg-white shadow-shop"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-[80%] animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-[45%] animate-pulse rounded bg-slate-200" />
            <div className="h-10 animate-pulse rounded-shop bg-slate-200" />
            <div className="h-10 animate-pulse rounded-shop bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
