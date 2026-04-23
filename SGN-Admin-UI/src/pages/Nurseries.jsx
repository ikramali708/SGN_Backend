import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Table from '../components/Table.jsx';
import Spinner from '../components/Spinner.jsx';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'owner', label: 'Owner' },
  { key: 'location', label: 'Location' },
  { key: 'plants', label: 'Total plants' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

export default function Nurseries() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/nurseries', {
        params: { search: query || undefined },
      });
      setList(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load nurseries.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function approve(id) {
    setBusyId(id);
    try {
      await api.put(`/api/admin/nurseries/${id}/approve`);
      await load();
    } catch (e) {
      alert(e.response?.data || e.message || 'Approve failed');
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id) {
    setBusyId(id);
    try {
      await api.put(`/api/admin/nurseries/${id}/reject`);
      await load();
    } catch (e) {
      alert(e.response?.data || e.message || 'Reject failed');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm(
      `Delete nursery #${id}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setBusyId(id);
    try {
      await api.delete(`/api/admin/nurseries/${id}`);
      setList((prev) => prev.filter((n) => n.nurseryId !== id));
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Nursery management</h1>
        <p className="text-slate-600">Approve or reject nursery registrations</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search name, owner, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
          onClick={() => setQuery(search.trim())}
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
        <Table columns={columns}>
          {list.map((n) => (
            <tr key={n.nurseryId} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{n.nurseryName}</td>
              <td className="px-4 py-3">{n.ownerName}</td>
              <td className="px-4 py-3">{n.address || n.city || '—'}</td>
              <td className="px-4 py-3">{n.totalPlants ?? 0}</td>
              <td className="px-4 py-3">
                <span className="mr-1 rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-medium text-primary">
                  {n.approvalStatus}
                </span>
                <span className="text-xs text-slate-500">{n.status}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {(n.approvalStatus || '').toLowerCase() !== 'approved' && (
                    <button
                      type="button"
                      disabled={busyId === n.nurseryId}
                      className="rounded bg-emerald-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      onClick={() => approve(n.nurseryId)}
                    >
                      Approve
                    </button>
                  )}
                  {(n.approvalStatus || '').toLowerCase() !== 'rejected' && (
                    <button
                      type="button"
                      disabled={busyId === n.nurseryId}
                      className="rounded bg-red-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      onClick={() => reject(n.nurseryId)}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`Delete nursery ${n.nurseryId}`}
                    title="Delete nursery"
                    disabled={busyId === n.nurseryId}
                    className="rounded p-1 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    onClick={() => remove(n.nurseryId)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.621l-.816 12.246A2.25 2.25 0 0 1 15.07 20.5H8.93a2.25 2.25 0 0 1-2.243-2.254L5.87 6H5.25a.75.75 0 0 1 0-1.5H9v-.75ZM10.5 4.5h3v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v.75Zm.75 4.5a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0V9Zm3 0a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0V9Z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
