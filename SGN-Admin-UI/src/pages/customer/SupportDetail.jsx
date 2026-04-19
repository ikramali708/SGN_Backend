import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

export default function CustomerSupportDetail() {
  const { id } = useParams();
  const toast = useShopToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/customer/support/${id}`);
      setTicket(data);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load ticket.'
      );
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/api/customer/support/${id}/reply`, {
        message: reply.trim(),
      });
      setTicket(data);
      setReply('');
      toast.success('Reply sent.');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Could not send reply.';
      toast.error(String(msg));
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Link
          to="/customer/support"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to support
        </Link>
        <p className="text-slate-600">Loading ticket…</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <Link
          to="/customer/support"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← Back to support
        </Link>
        <div className="rounded-shop border border-red-200 bg-red-50 p-4 text-red-800">
          {error || 'Ticket not found.'}
        </div>
      </div>
    );
  }

  const subject = pick(ticket, 'subject', 'Subject');
  const status = pick(ticket, 'status', 'Status');
  const initialMessage = pick(ticket, 'message', 'Message');
  const createdAt = pick(ticket, 'createdAt', 'CreatedAt');
  const orderId = pick(ticket, 'orderId', 'OrderId');
  const replies = Array.isArray(ticket.replies)
    ? ticket.replies
    : Array.isArray(ticket.Replies)
      ? ticket.Replies
      : [];

  const thread = [
    {
      id: 'initial',
      role: 'Customer',
      message: initialMessage,
      createdAt,
    },
    ...replies.map((r) => ({
      id: pick(r, 'id', 'Id'),
      role: pick(r, 'senderRole', 'SenderRole'),
      message: pick(r, 'message', 'Message'),
      createdAt: pick(r, 'createdAt', 'CreatedAt'),
    })),
  ];

  return (
    <div className="space-y-6 shop-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/customer/support"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Back to support
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-brand">{subject}</h1>
          <p className="text-sm text-slate-600">
            {createdAt ? new Date(createdAt).toLocaleString() : '—'}
            {orderId != null && orderId !== '' ? (
              <span className="ml-2">· Order #{orderId}</span>
            ) : null}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(status)}`}
        >
          {status}
        </span>
      </div>

      <div className="rounded-shop border border-brand-border bg-white p-4 shadow-shop sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Conversation
        </h2>
        <div className="flex max-h-[min(60vh,520px)] flex-col gap-3 overflow-y-auto pr-1">
          {thread.map((m) => {
            const isAdmin = String(m.role).toLowerCase() === 'admin';
            return (
              <div
                key={m.id}
                className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm sm:max-w-[70%]',
                    isAdmin
                      ? 'border-slate-200 bg-slate-50 text-slate-800'
                      : 'border-brand-border bg-brand-surface text-slate-900',
                  ].join(' ')}
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {isAdmin ? 'Admin' : 'You'}
                    {m.createdAt
                      ? ` · ${new Date(m.createdAt).toLocaleString()}`
                      : ''}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form className="mt-6 border-t border-brand-border pt-4" onSubmit={sendReply}>
          <label className="block text-sm font-medium text-slate-700">
            Your reply
          </label>
          <textarea
            className="mt-1 min-h-[88px] w-full rounded-shop border border-brand-border px-3 py-2 text-slate-900 outline-none ring-brand focus:ring-2"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={4000}
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="mt-3 rounded-shop bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-shop transition hover:bg-brand/90 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send reply'}
          </button>
        </form>
      </div>
    </div>
  );
}
