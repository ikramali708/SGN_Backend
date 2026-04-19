import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';

function pick(obj, camel, pascal) {
  return obj?.[camel] ?? obj?.[pascal];
}

function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'resolved')
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  if (s === 'inprogress')
    return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-brand-border bg-white text-brand';
}

export default function CustomerSupport() {
  const toast = useShopToast();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/customer/support');
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load tickets.'
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/api/customer/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadOrders();
  }, [loadTickets, loadOrders]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        subject: subject.trim(),
        message: message.trim(),
      };
      if (orderId) {
        const n = Number(orderId);
        if (!Number.isNaN(n)) body.orderId = n;
      }
      await api.post('/api/customer/support', body);
      toast.success('Support ticket created.');
      setSubject('');
      setMessage('');
      setOrderId('');
      await loadTickets();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not create ticket.';
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 shop-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand">Support</h1>
        <p className="text-slate-600">
          Contact the Smart Green Nursery admin team. We typically respond
          within one business day.
        </p>
      </div>

      <section className="rounded-shop border border-brand-border bg-white p-5 shadow-shop">
        <h2 className="text-lg font-semibold text-brand">New ticket</h2>
        <p className="mt-1 text-sm text-slate-600">
          Describe your issue. You can optionally link an order for faster
          context.
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              className="mt-1 w-full rounded-shop border border-brand-border px-3 py-2 text-slate-900 outline-none ring-brand focus:ring-2"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={250}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              className="mt-1 min-h-[120px] w-full rounded-shop border border-brand-border px-3 py-2 text-slate-900 outline-none ring-brand focus:ring-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={4000}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Related order (optional)
            </label>
            <select
              className="mt-1 w-full rounded-shop border border-brand-border bg-white px-3 py-2 text-slate-900 outline-none ring-brand focus:ring-2"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">None</option>
              {orders.map((o) => {
                const id = pick(o, 'orderId', 'OrderId');
                return (
                  <option key={id} value={id}>
                    Order #{id}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-shop bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-shop transition hover:bg-brand/90 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </form>
      </section>

      <section className="rounded-shop border border-brand-border bg-white p-5 shadow-shop">
        <h2 className="text-lg font-semibold text-brand">Your tickets</h2>
        {error && (
          <div className="mt-3 rounded-shop border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {loading ? (
          <p className="mt-4 text-slate-600">Loading…</p>
        ) : !tickets.length ? (
          <p className="mt-4 text-slate-600">You have no tickets yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-brand-border">
            {tickets.map((t) => {
              const id = pick(t, 'id', 'Id');
              const subj = pick(t, 'subject', 'Subject');
              const st = pick(t, 'status', 'Status');
              const created = pick(t, 'createdAt', 'CreatedAt');
              return (
                <li key={id} className="py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link
                        to={`/customer/support/${id}`}
                        className="font-semibold text-brand hover:underline"
                      >
                        {subj}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {created
                          ? new Date(created).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(st)}`}
                    >
                      {st}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
