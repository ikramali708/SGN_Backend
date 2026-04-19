import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Table from '../components/Table.jsx';
import Spinner from '../components/Spinner.jsx';

const columns = [
  { key: 'order', label: 'Order ID' },
  { key: 'nursery', label: 'Nursery' },
  { key: 'customer', label: 'Customer' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'qty', label: 'Quantity' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

function orderShippingLines(o) {
  const city = o.city ?? o.City;
  const province = o.province ?? o.Province;
  const country = o.country ?? o.Country;
  const phone = o.phoneNumber ?? o.PhoneNumber;
  const full = o.fullAddress ?? o.FullAddress;
  const legacy = o.shippingAddress ?? o.ShippingAddress;
  const comment = o.comment ?? o.Comment;
  const linePlace = [city, province, country].filter(Boolean).join(', ');
  const addr = (full || legacy || '').trim();
  const bits = [];
  if (linePlace) bits.push(linePlace);
  if (addr) bits.push(addr);
  if (phone) bits.push(`Phone: ${phone}`);
  if (comment) bits.push(`Note: ${comment}`);
  return bits.length ? bits.join(' · ') : (legacy || '—');
}

const statusOptions = ['Pending', 'Successful', 'Cancelled'];

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'successful')
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (s === 'cancelled') return 'bg-red-100 text-red-800 border-red-300';
  return 'bg-amber-100 text-amber-900 border-amber-300';
}

export default function Orders() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/admin/orders', {
          params: { page, pageSize },
        });
        if (!cancelled) {
          setItems(data.items ?? []);
          setTotalCount(data.totalCount ?? 0);
          setError('');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Failed to load orders.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function nurseryLabel(o) {
    const items = o.orderItems;
    if (!items?.length) return '—';
    const ids = [
      ...new Set(
        items.map((i) => i.plant?.nursery?.nurseryName || i.plant?.nurseryId)
      ),
    ];
    return ids.slice(0, 2).join(', ') + (ids.length > 2 ? '…' : '');
  }

  function qtySum(o) {
    const items = o.orderItems;
    if (!items?.length) return '—';
    return items.reduce((a, i) => a + (i.quantity || 0), 0);
  }

  async function patchStatus(orderId, newStatus) {
    try {
      await api.patch(`/api/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });
      setItems((prev) =>
        prev.map((o) =>
          o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } catch (e) {
      if (e.response?.status === 404 || e.response?.status === 405) {
        alert(
          'Order status update is not implemented on the API yet. Showing UI only.'
        );
      } else {
        alert(e.response?.data?.message || e.message || 'Update failed');
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Order monitoring</h1>
        <p className="text-slate-600">All customer orders</p>
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
            {items.map((o) => (
              <tr key={o.orderId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">#{o.orderId}</td>
                <td className="px-4 py-3 text-sm">{nurseryLabel(o)}</td>
                <td className="px-4 py-3 text-sm">
                  {o.customer?.name
                    ? `${o.customer.name} (#${o.customerId})`
                    : `#${o.customerId}`}
                </td>
                <td
                  className="max-w-[220px] px-4 py-3 text-xs text-slate-700"
                  title={orderShippingLines(o)}
                >
                  <span className="line-clamp-3">{orderShippingLines(o)}</span>
                </td>
                <td className="px-4 py-3">{qtySum(o)}</td>
                <td className="px-4 py-3 font-medium">
                  {Number(o.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span
                      className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadge(o.orderStatus)}`}
                    >
                      {o.orderStatus}
                    </span>
                    <select
                      className="max-w-[160px] rounded border border-primary/30 bg-white px-2 py-1 text-xs"
                      value={o.orderStatus}
                      onChange={(e) => patchStatus(o.orderId, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">
              Page {page} of {totalPages} · {totalCount} orders
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
