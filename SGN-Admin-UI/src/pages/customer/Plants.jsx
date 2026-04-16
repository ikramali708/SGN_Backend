import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import PlantGrid from './PlantGrid.jsx';
import PlantCatalogToolbar from '../../components/customer/PlantCatalogToolbar.jsx';
import {
  filterAndSortPlants,
  uniqueCategories,
} from '../../utils/plantCatalog.js';

export default function CustomerPlants() {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/plants');
        if (!cancelled) {
          setPlants(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Failed to load plants.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => uniqueCategories(plants), [plants]);
  const filtered = useMemo(
    () =>
      filterAndSortPlants(plants, {
        category,
        search: searchFromUrl,
        sort,
      }),
    [plants, category, searchFromUrl, sort]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 shop-slide-up">
        <h1 className="text-3xl font-bold text-brand">Plants</h1>
        <p className="mt-1 text-slate-600">
          {searchFromUrl
            ? `Results for “${searchFromUrl}” — browse and refine below.`
            : 'Browse the full catalog with filters and sorting.'}
        </p>
      </div>
      {!loading && !error && (
        <PlantCatalogToolbar
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />
      )}
      <PlantGrid
        plants={filtered}
        loading={loading}
        error={error}
        showAddToCart
        emptyTitle="No plants found"
        emptyDescription={
          searchFromUrl
            ? 'Try a different search term or clear filters.'
            : 'Nothing in this category right now. Check back soon.'
        }
      />
    </div>
  );
}
