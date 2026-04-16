import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { isTokenExpired, normalizeRole } from '../../auth/token.js';
import PlantGrid from './PlantGrid.jsx';
import CustomerHeroCarousel from '../../components/customer/CustomerHeroCarousel.jsx';
import CustomerHomeHero from '../../components/customer/CustomerHomeHero.jsx';
import PlantCatalogToolbar from '../../components/customer/PlantCatalogToolbar.jsx';
import {
  filterAndSortPlants,
  topFeaturedByPrice,
  uniqueCategories,
} from '../../utils/plantCatalog.js';

export default function CustomerHome() {
  const { token, role } = useAuth();
  const isCustomer =
    Boolean(token) &&
    !isTokenExpired(token) &&
    normalizeRole(role) === 'Customer';
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
  const featured = useMemo(() => topFeaturedByPrice(plants, 4), [plants]);
  const filtered = useMemo(
    () =>
      filterAndSortPlants(plants, {
        category,
        search: '',
        sort,
      }),
    [plants, category, sort]
  );

  return (
    <>
      <CustomerHomeHero />
      <CustomerHeroCarousel />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isCustomer && (
          <section className="shop-slide-up mb-10 rounded-shop border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-shop sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-brand">
                  Plant disease detector
                </h2>
                <p className="mt-1 max-w-xl text-sm text-slate-600">
                  Signed in? Upload a leaf photo to get AI-assisted disease
                  suggestions, care tips, and prevention ideas.
                </p>
              </div>
              <Link
                to="/customer/account/plant-disease"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-shop bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white shadow-shop transition hover:bg-brand-light"
              >
                Open detector
              </Link>
            </div>
          </section>
        )}
        {!loading && !error && featured.length > 0 && (
          <section className="shop-slide-up mb-14">
            <h2 className="mb-6 text-2xl font-bold text-brand">Featured plants</h2>
            <p className="mb-6 max-w-2xl text-sm text-slate-600">
              Our top picks by value — hand-picked from the catalog.
            </p>
            <PlantGrid
              plants={featured}
              loading={false}
              error=""
              showAddToCart
              skeletonCount={4}
            />
          </section>
        )}

        <section id="shop-catalog" className="scroll-mt-24">
          <h2 className="mb-2 text-2xl font-bold text-brand">Plants</h2>
          <p className="mb-6 text-slate-600">
            Filter by category and sort by price to find your perfect plant.
          </p>
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
            emptyTitle="No plants match your filters"
            emptyDescription="Try another category or sort option, or clear filters to see everything in stock."
          />
        </section>
      </div>
    </>
  );
}
