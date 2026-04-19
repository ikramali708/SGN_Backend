import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios.js';
import Spinner from '../../components/Spinner.jsx';

function pick(obj, camel, pascal) {
  return obj?.[camel] ?? obj?.[pascal];
}

const STATUS_OPTIONS = ['', 'Open', 'InProgress', 'Resolved'];

function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'resolved')
    return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (s === 'inprogress')
    return 'bg-amber-100 text-amber-900 border-amber-300';
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export default function AdminSupport() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedId = routeId ? Number(routeId) : null;

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/api/admin/support', { params });
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load tickets.'
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadDetail = useCallback(async (ticketId) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/api/admin/support/${ticketId}`);
      setDetail(data);
      setStatusDraft(pick(data, 'status', 'Status') || 'Open');
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId && !Number.isNaN(selectedId)) {
      loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const thread = useMemo(() => {
    if (!detail) return [];
    const initialMessage = pick(detail, 'message', 'Message');
    const createdAt = pick(detail, 'createdAt', 'CreatedAt');
    const replies = Array.isArray(detail.replies)
      ? detail.replies
      : Array.isArray(detail.Replies)
        ? detail.Replies
        : [];
    return [
      {
        id: 'initial',
        role: 'Customer',
        message: initialMessage,
        createdAt,
        label: 'Customer (initial)',
      },
      ...replies.map((r) => ({
        id: pick(r, 'id', 'Id'),
        role: pick(r, 'senderRole', 'SenderRole'),
        message: pick(r, 'message', 'Message'),
        createdAt: pick(r, 'createdAt', 'CreatedAt'),
        label: pick(r, 'senderRole', 'SenderRole'),
      })),
    ];
  }, [detail]);

  async function saveStatus() {
    if (!selectedId || !statusDraft) return;
    setBusy(true);
    try {
      await api.put(`/api/admin/support/${selectedId}/status`, {
        status: statusDraft,
      });
      await loadList();
      await loadDetail(selectedId);
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(e) {
    e.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/api/admin/support/${selectedId}/reply`, {
        message: reply.trim(),
      });
      setDetail(data);
      setReply('');
      await loadList();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Reply failed');
    } finally {
      setBusy(false);
    }
  }

  if (selectedId) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/support')}
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← All tickets
          </button>
          <h1 className="mt-2 text-2xl font-bold text-primary">Ticket detail</h1>
        </div>
        {detailLoading || !detail ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 rounded-lg border border-primary/20 bg-white p-5 shadow-sm lg:col-span-1">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Ticket
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {pick(detail, 'subject', 'Subject')}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">Customer:</span>{' '}
                {pick(detail, 'customerName', 'CustomerName') || '—'} (
                {pick(detail, 'customerEmail', 'CustomerEmail') || '—'})
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">User ID:</span>{' '}
                {pick(detail, 'userId', 'UserId')}
              </p>
              {pick(detail, 'orderId', 'OrderId') != null ? (
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Order:</span> #
                  {pick(detail, 'orderId', 'OrderId')}
                </p>
              ) : null}
              <div className="border-t border-slate-200 pt-4">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    className="w-full rounded border border-primary/30 bg-white px-3 py-2 text-sm sm:max-w-[200px]"
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                  >
                    {STATUS_OPTIONS.filter(Boolean).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={saveStatus}
                    className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    Save status
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-primary/20 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Thread
              </h2>
              <div className="flex max-h-[min(50vh,480px)] flex-col gap-3 overflow-y-auto pr-1">
                {thread.map((m) => {
                  const isAdmin = String(m.role).toLowerCase() === 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={[
                          'max-w-[88%] rounded-2xl border px-4 py-3 text-sm shadow-sm sm:max-w-[75%]',
                          isAdmin
                            ? 'border-primary/30 bg-primary text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-900',
                        ].join(' ')}
                      >
                        <p
                          className={`text-xs font-semibold ${isAdmin ? 'text-secondary' : 'text-slate-500'}`}
                        >
                          {m.label}
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
              <form className="border-t border-slate-200 pt-4" onSubmit={sendReply}>
                <label className="text-sm font-medium text-slate-700">
                  Admin reply
                </label>
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded border border-primary/30 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/40"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  maxLength={4000}
                  required
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-3 rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                >
                  {busy ? 'Sending…' : 'Send reply'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Support tickets</h1>
          <p className="text-slate-600">Customer requests and conversations</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase text-slate-500">
            Filter by status
          </label>
          <select
            className="max-w-xs rounded border border-primary/30 bg-white px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || 'all'} value={s}>
                {s === '' ? 'All' : s}
              </option>
            ))}
          </select>
        </div>
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
        <div className="overflow-x-auto rounded-lg border border-primary/20 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-primary/5 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => {
                const tid = pick(t, 'id', 'Id');
                return (
                  <tr key={tid} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">#{tid}</td>
                    <td className="px-4 py-3">
                      <Link
                        className="font-medium text-primary hover:underline"
                        to={`/admin/support/${tid}`}
                      >
                        {pick(t, 'subject', 'Subject')}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {pick(t, 'customerName', 'CustomerName') || '—'}
                      <span className="block text-xs text-slate-500">
                        {pick(t, 'customerEmail', 'CustomerEmail')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {pick(t, 'orderId', 'OrderId') ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadge(pick(t, 'status', 'Status'))}`}
                      >
                        {pick(t, 'status', 'Status')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {pick(t, 'createdAt', 'CreatedAt')
                        ? new Date(
                            pick(t, 'createdAt', 'CreatedAt')
                          ).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!tickets.length && (
            <p className="px-4 py-10 text-center text-slate-600">
              No tickets in this view.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
