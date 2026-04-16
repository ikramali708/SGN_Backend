import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  tokenHasAdminRole,
  tokenHasCustomerRole,
  tokenHasNurseryRole,
  tokenUserId,
} from '../auth/token.js';
import Spinner from '../components/Spinner.jsx';
import { pathAfterLogin } from '../utils/postLoginRedirect.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState('Admin');
  const [authTab, setAuthTab] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    nurseryName: '',
    ownerName: '',
    phoneNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint =
        role === 'Admin'
          ? '/api/admin/auth/login'
          : role === 'Customer'
            ? '/api/customer/auth/login'
            : authTab === 'signup'
              ? '/api/nursery/auth/signup'
              : '/api/nursery/auth/login';
      const payload =
        role === 'Admin' || role === 'Customer'
          ? {
              email: form.email,
              password: form.password,
            }
          : authTab === 'signup'
            ? {
                email: form.email,
                password: form.password,
                nurseryName: form.nurseryName,
                ownerName: form.ownerName,
                phoneNumber: form.phoneNumber,
                address: form.address,
              }
            : {
                email: form.email,
                password: form.password,
              };
      const { data } = await api.post(endpoint, payload);
      const token = data?.token;
      if (!token) {
        setError('Invalid response from server.');
        return;
      }
      if (role === 'Admin' && !tokenHasAdminRole(token)) {
        setError('This account is not authorized for admin access.');
        return;
      }
      if (role === 'NurseryOwner' && !tokenHasNurseryRole(token)) {
        setError('This account is not authorized for nursery access.');
        return;
      }
      if (role === 'Customer' && !tokenHasCustomerRole(token)) {
        setError('This account is not authorized for customer access.');
        return;
      }
      const userId =
        data?.userId ??
        data?.UserId ??
        data?.id ??
        data?.nurseryId ??
        data?.adminId ??
        tokenUserId(token);
      const resolvedRole =
        role === 'Customer'
          ? data?.role ?? data?.Role ?? 'Customer'
          : role;
      login(token, resolvedRole, userId);
      const params = new URLSearchParams(location.search);
      const redirectParam = params.get('redirect');
      const next = pathAfterLogin(resolvedRole, redirectParam);
      navigate(next, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data &&
        typeof err.response.data === 'string'
          ? err.response.data
          : err.response?.data?.message ||
            err.response?.data?.title ||
            'Login failed. Check email and password.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
        <div className="rounded-lg border border-primary/30 bg-white p-1 shadow">
          {['Admin', 'NurseryOwner', 'Customer'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setAuthTab('login');
                setError('');
              }}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-semibold transition',
                role === r
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-primary/10',
              ].join(' ')}
            >
              {r === 'NurseryOwner'
                ? 'Nursery Owner'
                : r === 'Customer'
                  ? 'Customer'
                  : 'Admin'}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full max-w-md rounded-2xl border-2 border-primary/35 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-primary">
          {role === 'Admin'
            ? 'SGN Admin Login'
            : role === 'Customer'
              ? 'SGN Customer Login'
              : 'SGN Nursery Access'}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {role === 'Admin'
            ? 'Sign in with your admin credentials'
            : role === 'Customer'
              ? 'Sign in to browse plants and track your orders'
              : 'Login or sign up to manage your nursery'}
        </p>
        {role === 'Customer' && (
          <div className="mt-5 text-center">
            <Link
              to="/customer/signup"
              className="inline-flex rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Create account
            </Link>
          </div>
        )}
        {role === 'NurseryOwner' && (
          <div className="mt-5 grid grid-cols-2 rounded-lg border border-primary/25 p-1">
            <button
              type="button"
              className={[
                'rounded-md px-3 py-2 text-sm font-semibold transition',
                authTab === 'login'
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-primary/10',
              ].join(' ')}
              onClick={() => setAuthTab('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={[
                'rounded-md px-3 py-2 text-sm font-semibold transition',
                authTab === 'signup'
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-primary/10',
              ].join(' ')}
              onClick={() => setAuthTab('signup')}
            >
              Sign up
            </button>
          </div>
        )}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
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
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-primary/25 px-3 py-2.5 outline-none ring-primary focus:border-primary focus:ring-2"
            />
          </div>
          {role === 'NurseryOwner' && authTab === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Nursery Name
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
                  Owner Name
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
                  Phone Number
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
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow transition hover:bg-primary-light disabled:opacity-60"
          >
            {loading && <Spinner className="!h-5 !w-5 border-2" />}
            {role === 'NurseryOwner' && authTab === 'signup'
              ? 'Create account'
              : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
