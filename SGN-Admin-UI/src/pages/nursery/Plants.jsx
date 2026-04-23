import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Spinner from '../../components/Spinner.jsx';
import { getToken } from '../../auth/token.js';

const columns = [
  { key: 'name', label: 'Plant' },
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'actions', label: 'Actions' },
];

const initialForm = {
  plantName: '',
  description: '',
  categoryId: '',
  price: '',
  stockQuantity: '',
};

export default function NurseryPlants() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const imagePreview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function loadPlants() {
    setLoading(true);
    try {
      const { data } = await api.get('/api/nursery/plants');
      setItems(data.items ?? data ?? []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load plants.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const hasToken = Boolean(getToken());
      console.log('[NurseryPlants] Loading categories. Token present:', hasToken);
      const response = await api.get('/api/categories');
      console.log('[NurseryPlants] Categories API response:', response.data);

      const raw = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
          ? response.data.items
          : [];

      const mapped = raw
        .map((c) => ({
          categoryId: c.categoryId ?? c.id,
          categoryName: c.categoryName ?? c.name,
        }))
        .filter((c) => c.categoryId != null && c.categoryName);

      console.log('[NurseryPlants] Mapped categories:', mapped);
      setCategories(mapped);
    } catch (e) {
      if (e.response?.status === 401) {
        console.warn(
          '[NurseryPlants] Category fetch unauthorized. Ensure Bearer token is valid and accepted for this endpoint.'
        );
      }
      setError(
        e.response?.data?.message || e.message || 'Failed to load categories.'
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (showModal) {
      loadCategories();
    }
  }, [showModal]);

  function beginEdit(plant) {
    setEditingId(plant.plantId);
    setForm({
      plantName: plant.plantName ?? '',
      description: plant.description ?? '',
      categoryId: plant.categoryId ?? '',
      price: plant.price ?? '',
      stockQuantity: plant.stockQuantity ?? '',
    });
    setSelectedFile(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  }

  function beginAdd() {
    setEditingId(null);
    setForm(initialForm);
    setSelectedFile(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const priceValue = Number(form.price);
    const stockValue = Number(form.stockQuantity);
    if (priceValue <= 0) {
      setError('Price must be greater than 0.');
      setSaving(false);
      return;
    }
    if (stockValue < 0) {
      setError('Stock quantity must be 0 or greater.');
      setSaving(false);
      return;
    }

    try {
      if (!editingId && !selectedFile) {
        setError('Plant image is required.');
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append('plantName', form.plantName);
      formData.append('description', form.description);
      formData.append('price', String(priceValue));
      formData.append('categoryId', String(form.categoryId));
      formData.append('stockQuantity', String(stockValue));
      formData.append('status', 'Active');
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      if (editingId) {
        await api.put(`/api/nursery/plants/${editingId}`, formData);
        setSuccess('Updated Successfully');
      } else {
        await api.post('/api/nursery/plants', formData);
        setSuccess('Plant added successfully.');
      }
      setForm(initialForm);
      setSelectedFile(null);
      setEditingId(null);
      setShowModal(false);
      await loadPlants();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to save plant.');
    } finally {
      setSaving(false);
    }
  }

  async function removePlant(id) {
    if (!confirm('Delete this plant?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/nursery/plants/${id}`);
      setItems((prev) => prev.filter((x) => x.plantId !== id));
      setSuccess('Plant deleted successfully.');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to delete plant.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Plant management</h1>
        <p className="text-slate-600">Add, update, and remove your plants</p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={beginAdd}
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
        >
          Add Plant
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
          {items.map((p) => (
            <tr key={p.plantId} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{p.plantName}</td>
              <td className="px-4 py-3 text-sm">{p.description || '—'}</td>
              <td className="px-4 py-3">{p.categoryName ?? p.category?.categoryName ?? p.categoryId}</td>
              <td className="px-4 py-3">{Number(p.price || 0).toFixed(2)}</td>
              <td className="px-4 py-3">{p.stockQuantity}</td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => beginEdit(p)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removePlant(p.plantId)}
                    className="text-sm font-semibold text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl border-2 border-primary/30 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary">
              {editingId ? 'Update Plant' : 'Add Plant'}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Plant Name
                </label>
                <input
                  required
                  value={form.plantName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, plantName: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  required
                  disabled={loadingCategories}
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, categoryId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 bg-white px-3 py-2 outline-none focus:border-primary"
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                  {!loadingCategories && categories.length === 0 && (
                    <option value="" disabled>
                      No categories found
                    </option>
                  )}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Price
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Stock Quantity
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stockQuantity: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingId}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    className="mt-3 h-24 w-24 rounded-md object-cover"
                  />
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm(initialForm);
                    setSelectedFile(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Plant' : 'Add Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
