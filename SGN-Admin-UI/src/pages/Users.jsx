import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Table from '../components/Table.jsx';
import Spinner from '../components/Spinner.jsx';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

export default function Users() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
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
        const { data } = await api.get('/api/admin/users', {
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
            e.response?.data?.message ||
              e.message ||
              'Failed to load users.'
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

  async function deleteUser(userId) {
    const confirmed = window.confirm(
      `Delete user #${userId}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setItems((prev) => prev.filter((u) => u.userId !== userId));
      setTotalCount((count) => Math.max(0, count - 1));
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to delete user.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">User management</h1>
        <p className="text-slate-600">Registered accounts</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search name, email, phone…"
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
            {items.map((u) => (
              <tr key={u.userId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{u.userId}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-medium text-primary">
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    aria-label={`Delete user ${u.userId}`}
                    title="Delete user"
                    className="rounded p-1 text-red-700 transition hover:bg-red-50"
                    onClick={() => deleteUser(u.userId)}
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
                </td>
              </tr>
            ))}
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">
              Page {page} of {totalPages} · {totalCount} users
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="rounded-lg border border-primary/30 px-3 py-1 font-medium disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                className="rounded-lg border border-primary/30 px-3 py-1 font-medium disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
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
