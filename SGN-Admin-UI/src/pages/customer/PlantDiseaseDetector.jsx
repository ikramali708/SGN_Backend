import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';

function pickMessage(err) {
  const d = err.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return d.message;
  if (d?.detail) return d.detail;
  return err.message || 'Something went wrong.';
}

export default function PlantDiseaseDetector() {
  const toast = useShopToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFileChange = useCallback((e) => {
    const next = e.target.files?.[0];
    setError('');
    setResult(null);
    setFile(next || null);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please choose an image first.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await api.post('/api/plant-disease/detect', form);
      setResult(data);
      toast.success('Analysis complete.');
    } catch (err) {
      const msg = pickMessage(err);
      setError(msg);
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }

  const confidencePct =
    result != null && typeof result.confidence === 'number'
      ? (result.confidence * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6 shop-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand">Plant disease detector</h1>
        <p className="text-slate-600">
          Upload a clear photo of a plant leaf. Results use our ML model and are for
          guidance only—confirm serious issues with a local expert when needed.
        </p>
      </div>

      {error && (
        <div className="rounded-shop border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-shop border border-brand-border bg-white p-5 shadow-shop"
      >
        <div>
          <label
            htmlFor="leaf-image"
            className="block text-sm font-semibold text-slate-700"
          >
            Leaf image
          </label>
          <input
            id="leaf-image"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-shop file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-brand-light"
          />
        </div>

        {previewUrl && (
          <div className="overflow-hidden rounded-shop border border-slate-200 bg-brand-surface p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Preview
            </p>
            <img
              src={previewUrl}
              alt="Selected leaf"
              className="mx-auto max-h-64 max-w-full rounded-lg object-contain"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-shop bg-brand px-4 py-2.5 font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:opacity-60 sm:w-auto"
        >
          {loading && (
            <Spinner className="!h-5 !w-5 !border-2 !border-white !border-t-transparent" />
          )}
          {loading ? 'Analyzing…' : 'Detect disease'}
        </button>
      </form>

      {result && (
        <div className="rounded-shop border border-emerald-200 bg-white p-5 shadow-shop">
          <h2 className="text-lg font-bold text-brand">Results</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Disease / class</dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {result.disease_name ?? result.DiseaseName ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Confidence</dt>
              <dd className="mt-1 text-base text-slate-900">
                {confidencePct != null ? `${confidencePct}%` : '—'}
              </dd>
            </div>
            {(result.class_id != null || result.ClassId != null) && (
              <div>
                <dt className="font-semibold text-slate-500">Class ID</dt>
                <dd className="mt-1 text-slate-800">
                  {result.class_id ?? result.ClassId}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-slate-500">Treatment</dt>
              <dd className="mt-1 leading-relaxed text-slate-800">
                {result.treatment ?? result.Treatment ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Prevention</dt>
              <dd className="mt-1 leading-relaxed text-slate-800">
                {result.prevention ?? result.Prevention ?? '—'}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
