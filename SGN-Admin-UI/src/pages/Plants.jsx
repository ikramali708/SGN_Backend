import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Table from '../components/Table.jsx';
import Spinner from '../components/Spinner.jsx';

const columns = [
  { key: 'plant', label: 'Plant' },
  { key: 'nursery', label: 'Nursery' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'actions', label: 'Actions' },
];

export default function Plants() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/admin/plants', {
          params: { search: query || undefined, page, pageSize },
        });
        if (!cancelled) {
          setItems(data.items ?? []);
          setTotalCount(data.totalCount ?? 0);
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
  }, [page, pageSize, query]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  async function removePlant(id) {
    if (!confirm('Delete this plant? The API may not support delete yet.')) {
      return;
    }
    try {
      await api.delete(`/api/admin/plants/${id}`);
      setItems((prev) => prev.filter((p) => p.plantId !== id));
      setTotalCount((t) => Math.max(0, t - 1));
    } catch (e) {
      alert(
        e.response?.status === 404 || e.response?.status === 405
          ? 'Delete is not implemented on the backend for this resource.'
          : e.response?.data?.message || e.message || 'Delete failed'
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Plant monitoring</h1>
        <p className="text-slate-600">Catalog across nurseries</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search plant name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          onClick={() => {
            setPage(1);
            setQuery(search.trim());
          }}
        >
          Search
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <Table columns={columns}>
            {items.map((p) => (
              <tr key={p.plantId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{p.plantName}</td>
                <td className="px-4 py-3">
                  {p.nursery?.nurseryName ?? `Nursery #${p.nurseryId}`}
                </td>
                <td className="px-4 py-3">
                  {p.category?.categoryName ?? `Category #${p.categoryId}`}
                </td>
                <td className="px-4 py-3">{Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-700 hover:underline"
                    onClick={() => removePlant(p.plantId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">
              Page {page} of {totalPages} · {totalCount} plants
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded-lg border border-primary/30 px-3 py-1 font-medium disabled:opacity-40"
                onClick={() => setPage((x) => Math.max(1, x - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded-lg border border-primary/30 px-3 py-1 font-medium disabled:opacity-40"
                onClick={() => setPage((x) => x + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
