import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Spinner from '../../components/Spinner.jsx';

const columns = [
  { key: 'plant', label: 'Plant' },
  { key: 'currentStock', label: 'Current Stock' },
  { key: 'newStock', label: 'Update Stock' },
];

export default function NurseryInventory() {
  const [items, setItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/nursery/inventory');
        if (!cancelled) {
          const list = data.items ?? data ?? [];
          setItems(list);
          setStockMap(
            Object.fromEntries(
              list.map((x) => [x.plantId, String(x.stockQuantity ?? 0)])
            )
          );
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Failed to load inventory.'
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

  async function updateStock(plantId) {
    try {
      await api.patch(`/api/nursery/inventory/${plantId}`, {
        stockQuantity: Number(stockMap[plantId]),
      });
      setItems((prev) =>
        prev.map((x) =>
          x.plantId === plantId
            ? { ...x, stockQuantity: Number(stockMap[plantId]) }
            : x
        )
      );
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to update stock.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Inventory</h1>
        <p className="text-slate-600">Review stock and update quantities</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      <Table columns={columns}>
        {items.map((item) => (
          <tr key={item.plantId} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium">{item.plantName}</td>
            <td className="px-4 py-3">{item.stockQuantity}</td>
            <td className="px-4 py-3">
              <div className="flex max-w-xs items-center gap-2">
                <input
                  type="number"
                  value={stockMap[item.plantId] ?? ''}
                  onChange={(e) =>
                    setStockMap((prev) => ({
                      ...prev,
                      [item.plantId]: e.target.value,
                    }))
                  }
                  className="w-24 rounded border border-primary/25 px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => updateStock(item.plantId)}
                  className="rounded bg-primary px-3 py-1 text-xs font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
