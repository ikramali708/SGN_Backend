import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import loginBackground from '../assets/login-back.jpg';
import logoUrl from '../assets/Logo.png';

export default function NurserySignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    nurseryName: '',
    ownerName: '',
    phoneNumber: '',
    address: '',
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
      await api.post('/api/nursery/auth/signup', {
        email: form.email,
        password: form.password,
        nurseryName: form.nurseryName,
        ownerName: form.ownerName,
        phone: form.phoneNumber,
        address: form.address,
      });
      setSuccess('Registration submitted. Await admin approval, then sign in.');
      setTimeout(() => navigate('/login', { replace: true }), 1600);
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
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border-2 border-primary/35 bg-white p-8 shadow-lg">
        <div className="flex justify-center">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/customer-dashboard" aria-label="Go to customer dashboard">
              <img
                src={logoUrl}
                alt="logo"
                style={{ height: '60px', width: 'auto' }}
              />
            </Link>
            <h1 className="text-2xl font-bold text-primary">
              Register your nursery
            </h1>
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          After approval you can sign in from the main login page.
        </p>
        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
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
            <div
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              role="status"
            >
              {success}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Nursery name
            </label>
            <input
              required
              value={form.nurseryName}
              onChange={(e) => updateField('nurseryName', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Owner name
            </label>
            <input
              required
              value={form.ownerName}
              onChange={(e) => updateField('ownerName', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Phone number
            </label>
            <input
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow transition hover:bg-primary-light disabled:opacity-60"
          >
            {loading && <Spinner className="!h-5 !w-5 border-2" />}
            Create nursery account
          </button>
        </form>
      </div>
    </div>
  );
}
