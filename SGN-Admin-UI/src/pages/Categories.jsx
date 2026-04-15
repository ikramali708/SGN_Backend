import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Table from '../components/Table.jsx';
import Spinner from '../components/Spinner.jsx';

const columns = [
  { key: 'name', label: 'Category Name' },
  { key: 'actions', label: 'Actions' },
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const catRes = await api.get('/api/admin/categories');
      const cats = Array.isArray(catRes.data) ? catRes.data : [];
      setCategories(cats);
      setError('');
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load categories.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    setSavingNew(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/admin/categories', { categoryName: newName });
      setModal(false);
      setNewName('');
      setSuccess('Category created successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Create failed');
    } finally {
      setSavingNew(false);
    }
  }

  function openEditModal(category) {
    setEditing(category);
    setEditName(category.categoryName);
    setError('');
    setSuccess('');
  }

  async function updateCategory(e) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/admin/categories/${editing.categoryId}`, {
        categoryName: editName,
      });
      setEditing(null);
      setEditName('');
      setSuccess('Category updated successfully.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.categoryName}"?`
    );
    if (!confirmed) return;

    setDeletingId(category.categoryId);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/admin/categories/${category.categoryId}`);
      setSuccess('Category deleted successfully.');
      setCategories((prev) =>
        prev.filter((x) => x.categoryId !== category.categoryId)
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Categories</h1>
          <p className="text-slate-600">Plant taxonomy</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white shadow"
          onClick={() => setModal(true)}
        >
          Add category
        </button>
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
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <Table columns={columns}>
          {categories.map((c) => (
            <tr key={c.categoryId} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{c.categoryName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Edit ${c.categoryName}`}
                    title="Edit category"
                    className="rounded p-1 text-primary transition hover:bg-primary/10"
                    onClick={() => openEditModal(c)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L9.75 16.963l-4.5 1.318 1.318-4.5L16.862 3.487ZM4.5 19.5h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1 0-1.5Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${c.categoryName}`}
                    title="Delete category"
                    disabled={deletingId === c.categoryId}
                    className="rounded p-1 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    onClick={() => deleteCategory(c)}
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
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-primary/30 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary">New category</h3>
            <form className="mt-4 space-y-4" onSubmit={addCategory}>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNew}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                >
                  {savingNew ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-primary/30 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary">Edit category</h3>
            <form className="mt-4 space-y-4" onSubmit={updateCategory}>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                >
                  {savingEdit ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
