import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { normalizeRole, tokenRole, tokenUserId } from '../auth/token.js';
import Spinner from '../components/Spinner.jsx';
import { pathAfterLogin } from '../utils/postLoginRedirect.js';
import loginBackground from '../assets/login-back.jpg';
import logoUrl from '../assets/Logo.png';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
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
      const { data } = await api.post('/api/user/login', {
        email: form.email,
        password: form.password,
      });
      const token = data?.token;
      if (!token) {
        setError('Invalid response from server.');
        return;
      }
      const userId =
        data?.userId ??
        data?.UserId ??
        data?.id ??
        data?.nurseryId ??
        tokenUserId(token);
      const resolvedRole = normalizeRole(
        data?.role ?? data?.Role ?? tokenRole(token)
      );
      if (!resolvedRole) {
        setError('Invalid response from server.');
        return;
      }
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
                style={{ height: '70px', width: 'auto' }}
              />
            </Link>
            <h1 className="text-2xl font-bold text-primary">Sign in</h1>
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-slate-500">
          Use your email and password. You will be sent to the right dashboard
          for your account.
        </p>
        <div className="mt-5 flex flex-col gap-2 text-center text-sm">
          <Link
            to="/customer/signup"
            className="inline-flex justify-center rounded-lg border-2 border-primary px-4 py-2 font-semibold text-primary transition hover:bg-primary/10"
          >
            Create customer account
          </Link>
          <Link
            to="/nursery/signup"
            className="font-semibold text-primary hover:underline"
          >
            Register as nursery owner
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
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white shadow transition hover:bg-primary-light disabled:opacity-60"
          >
            {loading && <Spinner className="!h-5 !w-5 border-2" />}
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
