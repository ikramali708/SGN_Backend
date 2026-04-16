export function plantId(p) {
  return p.plantId ?? p.PlantId;
}

export function plantName(p) {
  return p.plantName ?? p.PlantName ?? '';
}

export function plantPrice(p) {
  return Number(p.price ?? p.Price ?? 0);
}

export function plantCategoryName(p) {
  return p.categoryName ?? p.CategoryName ?? 'Uncategorized';
}

export function uniqueCategories(plants) {
  const set = new Set(
    plants.map((p) => plantCategoryName(p)).filter(Boolean)
  );
  return ['All', ...[...set].sort((a, b) => a.localeCompare(b))];
}

export function filterAndSortPlants(plants, { category, search, sort }) {
  let list = [...plants];
  if (category && category !== 'All') {
    list = list.filter((p) => plantCategoryName(p) === category);
  }
  const q = (search || '').trim().toLowerCase();
  if (q) {
    list = list.filter((p) => plantName(p).toLowerCase().includes(q));
  }
  if (sort === 'price-asc') {
    list.sort((a, b) => plantPrice(a) - plantPrice(b));
  } else if (sort === 'price-desc') {
    list.sort((a, b) => plantPrice(b) - plantPrice(a));
  }
  // sort === 'default' → keep API order
  return list;
}

export function topFeaturedByPrice(plants, n = 4) {
  if (!plants?.length) return [];
  return [...plants]
    .sort((a, b) => plantPrice(b) - plantPrice(a))
    .slice(0, n);
}
