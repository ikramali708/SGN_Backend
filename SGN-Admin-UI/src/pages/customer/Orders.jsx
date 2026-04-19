import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api.js';
import OrderListSkeleton from '../../components/customer/OrderListSkeleton.jsx';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';

function orderId(o) {
  return o.orderId ?? o.OrderId;
}

function orderStatus(o) {
  return o.orderStatus ?? o.OrderStatus ?? '';
}

function totalAmount(o) {
  return o.totalAmount ?? o.TotalAmount ?? 0;
}

function orderDate(o) {
  const d = o.orderDate ?? o.OrderDate;
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function pick(o, camel, pascal) {
  return o[camel] ?? o[pascal];
}

export default function CustomerOrders({ cancelledOnly = false }) {
  const toast = useShopToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/customer/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load orders.'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelOrder(id) {
    if (!window.confirm('Cancel this pending order?')) return;
    setBusyId(id);
    try {
      await api.put(`/api/customer/orders/${id}/cancel`);
      await load();
      toast.success('Order cancelled.');
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || 'Could not cancel order.';
      toast.error(String(msg));
    } finally {
      setBusyId(null);
    }
  }

  const visible = cancelledOnly
    ? orders.filter(
        (o) => String(orderStatus(o)).toLowerCase() === 'cancelled'
      )
    : orders;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand">
            {cancelledOnly ? 'Cancelled orders' : 'My orders'}
          </h1>
          <p className="text-slate-600">
            {cancelledOnly
              ? 'Orders you have cancelled'
              : 'Track and manage your COD orders'}
          </p>
        </div>
        <OrderListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 shop-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand">
          {cancelledOnly ? 'Cancelled orders' : 'My orders'}
        </h1>
        <p className="text-slate-600">
          {cancelledOnly
            ? 'Orders you have cancelled'
            : 'Track and manage your COD orders'}
        </p>
      </div>
      {error && (
        <div className="rounded-shop border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}
      {!visible.length ? (
        <div className="rounded-shop border border-dashed border-brand-border bg-brand-surface px-6 py-14 text-center">
          <p className="font-semibold text-brand">
            {cancelledOnly ? 'No cancelled orders yet' : 'No orders yet'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {cancelledOnly
              ? 'When you cancel a pending order, it will appear here.'
              : 'When you place an order, it will show up here for tracking.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((o) => {
            const id = orderId(o);
            const status = orderStatus(o);
            const pending =
              String(status).toLowerCase() === 'pending';
            return (
              <div
                key={id}
                className="rounded-shop border border-brand-border bg-white p-5 shadow-shop transition-all duration-300 ease-out hover:shadow-shop-hover"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-brand">Order #{id}</p>
                    <p className="text-sm text-slate-600">{orderDate(o)}</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Status:{' '}
                      <span className="font-semibold capitalize">{status}</span>
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      Total: Rs. {Number(totalAmount(o)).toFixed(2)}
                    </p>
                    {(pick(o, 'shippingAddress', 'ShippingAddress') ||
                      pick(o, 'fullAddress', 'FullAddress')) && (
                      <div className="mt-3 space-y-1 rounded-shop border border-brand-border/60 bg-brand-surface/50 px-3 py-2 text-sm text-slate-700">
                        <p className="font-semibold text-brand">Delivery details</p>
                        {(pick(o, 'country', 'Country') ||
                          pick(o, 'province', 'Province') ||
                          pick(o, 'city', 'City')) && (
                          <p>
                            {[pick(o, 'city', 'City'), pick(o, 'province', 'Province'), pick(o, 'country', 'Country')]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                        {(pick(o, 'fullAddress', 'FullAddress') ||
                          pick(o, 'shippingAddress', 'ShippingAddress')) && (
                          <p className="whitespace-pre-wrap">
                            {pick(o, 'fullAddress', 'FullAddress') ||
                              pick(o, 'shippingAddress', 'ShippingAddress')}
                          </p>
                        )}
                        {pick(o, 'phoneNumber', 'PhoneNumber') && (
                          <p>
                            Receiver phone:{' '}
                            <span className="font-medium">{pick(o, 'phoneNumber', 'PhoneNumber')}</span>
                          </p>
                        )}
                        {pick(o, 'comment', 'Comment') && (
                          <p className="text-slate-600">
                            Comment: {pick(o, 'comment', 'Comment')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {!cancelledOnly && pending && (
                    <button
                      type="button"
                      disabled={busyId === id}
                      onClick={() => cancelOrder(id)}
                      className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-shop border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-all duration-300 ease-out hover:bg-red-50 disabled:opacity-60"
                    >
                      {busyId === id ? 'Cancelling…' : 'Cancel order'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
