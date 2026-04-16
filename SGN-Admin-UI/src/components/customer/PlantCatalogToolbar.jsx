export default function PlantCatalogToolbar({
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-shop border border-brand-border bg-white p-4 shadow-shop sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-shop border border-brand-border bg-brand-surface px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40 sm:max-w-xs"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0 sm:w-56">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Sort by price
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-shop border border-brand-border bg-brand-surface px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40"
        >
          <option value="default">Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>
    </div>
  );
}
