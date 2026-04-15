export default function Card({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-white p-5 shadow-sm transition hover:border-primary/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/40 text-xl">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
