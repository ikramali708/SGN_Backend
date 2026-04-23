import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Spinner from '../../components/Spinner.jsx';

const columns = [
  { key: 'id', label: 'Order ID' },
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

const statusOptions = ['Pending', 'Completed', 'Cancelled'];

export default function NurseryOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/nursery/orders');
        if (!cancelled) setItems(data.items ?? data ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || 'Failed to load orders.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(orderId, orderStatus) {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/api/nursery/orders/${orderId}/status`, { status: orderStatus });
      const resolvedStatus = data?.orderStatus ?? orderStatus;
      setItems((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: resolvedStatus } : o))
      );
      setSuccess('Updated Successfully');
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to update order status.'
      );
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
        <h1 className="text-2xl font-bold text-primary">Orders</h1>
        <p className="text-slate-600">View and update order status</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          {success}
        </div>
      )}
      <Table columns={columns}>
        {items.map((o) => (
          <tr key={o.orderId} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium">#{o.orderId}</td>
            <td className="px-4 py-3">{o.customer?.name ?? `#${o.customerId}`}</td>
            <td
              className="max-w-[220px] px-4 py-3 text-xs text-slate-700"
              title={orderShippingLines(o)}
            >
              <span className="line-clamp-3">{orderShippingLines(o)}</span>
            </td>
            <td className="px-4 py-3">
              {(o.orderItems ?? []).reduce((sum, item) => sum + (item.quantity || 0), 0)}
            </td>
            <td className="px-4 py-3">{Number(o.totalAmount || 0).toFixed(2)}</td>
            <td className="px-4 py-3">
              <select
                value={o.orderStatus}
                onChange={(e) => updateStatus(o.orderId, e.target.value)}
                className="rounded border border-primary/30 bg-white px-2 py-1 text-xs"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
