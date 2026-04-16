import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';
import { useShopToast } from '../../contexts/ShopToastContext.jsx';

export default function CustomerProfile() {
  const toast = useShopToast();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/customer/profile');
        if (!cancelled) {
          setProfile({
            name: data.name ?? data.Name ?? '',
            email: data.email ?? data.Email ?? '',
            phone: data.phone ?? data.Phone ?? '',
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Failed to load profile.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavingProfile(true);
    try {
      await api.put('/api/customer/profile', {
        name: profile.name,
        phone: profile.phone,
      });
      setSuccess('Profile updated successfully.');
      toast.success('Profile saved.');
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || 'Failed to update profile.';
      setError(msg);
      toast.error(String(msg));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavingPassword(true);
    try {
      await api.put('/api/customer/change-password', {
        oldPassword: password.oldPassword,
        newPassword: password.newPassword,
      });
      setPassword({ oldPassword: '', newPassword: '' });
      setSuccess('Password changed successfully.');
      toast.success('Password updated.');
    } catch (e) {
      const msg =
        e.response?.data?.message || e.message || 'Failed to change password.';
      setError(msg);
      toast.error(String(msg));
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 shop-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand">My profile</h1>
        <p className="text-slate-600">Update your name, phone, and password</p>
      </div>
      {error && (
        <div className="rounded-shop border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-shop border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
          {success}
        </div>
      )}
      <form
        onSubmit={saveProfile}
        className="grid gap-4 rounded-shop border border-brand-border bg-white p-5 shadow-shop sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            readOnly
            value={profile.email}
            className="mt-1 w-full cursor-not-allowed rounded-shop border border-slate-200 bg-brand-surface px-3 py-2.5 text-slate-600"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            required
            value={profile.name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, name: e.target.value }))
            }
            className="mt-1 w-full rounded-shop border border-brand-border bg-white px-3 py-2.5 outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Phone
          </label>
          <input
            value={profile.phone}
            onChange={(e) =>
              setProfile((p) => ({ ...p, phone: e.target.value }))
            }
            className="mt-1 w-full rounded-shop border border-brand-border bg-white px-3 py-2.5 outline-none transition-all duration-300 ease-out focus:border-brand-light focus:ring-2 focus:ring-brand-light/40"
          />
        </div>
        <button
          type="submit"
          disabled={savingProfile}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-shop bg-brand px-4 py-2.5 font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:opacity-60 sm:col-span-2"
        >
          {savingProfile && (
            <Spinner className="!h-5 !w-5 !border-2 !border-white !border-t-transparent" />
          )}
          Save profile
        </button>
      </form>

      <form
        onSubmit={changePassword}
        className="grid gap-4 rounded-shop border border-brand-border bg-white p-5 shadow-shop sm:grid-cols-2"
      >
        <input
          type="password"
          placeholder="Current password"
          value={password.oldPassword}
          onChange={(e) =>
            setPassword((p) => ({ ...p, oldPassword: e.target.value }))
          }
          className="rounded-shop border border-brand-border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-light/40"
          required
        />
        <input
          type="password"
          placeholder="New password"
          value={password.newPassword}
          onChange={(e) =>
            setPassword((p) => ({ ...p, newPassword: e.target.value }))
          }
          className="rounded-shop border border-brand-border bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-light/40"
          required
        />
        <button
          type="submit"
          disabled={savingPassword}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-shop bg-brand px-4 py-2.5 font-semibold text-white shadow-shop transition-all duration-300 ease-out hover:bg-brand-light disabled:opacity-60 sm:col-span-2"
        >
          {savingPassword && (
            <Spinner className="!h-5 !w-5 !border-2 !border-white !border-t-transparent" />
          )}
          Change password
        </button>
      </form>
    </div>
  );
}
