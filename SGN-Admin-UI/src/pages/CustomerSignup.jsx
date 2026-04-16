import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';

export default function CustomerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/customer/auth/register', form);
      setSuccess('Account created. You can sign in now.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      const msg =
        err.response?.data &&
        typeof err.response.data === 'string'
          ? err.response.data
          : err.response?.data?.message ||
            err.response?.data?.title ||
            'Registration failed.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border-2 border-primary/35 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary">
          Create customer account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Join SGN to browse plants and place COD orders
        </p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow transition hover:bg-primary-light disabled:opacity-60"
          >
            {loading && <Spinner className="!h-5 !w-5 border-2" />}
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
