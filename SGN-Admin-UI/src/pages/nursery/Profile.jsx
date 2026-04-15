import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Spinner from '../../components/Spinner.jsx';

export default function NurseryProfile() {
  const [profile, setProfile] = useState({
    nurseryName: '',
    ownerName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/nursery/profile');
        if (!cancelled) setProfile((prev) => ({ ...prev, ...data }));
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || 'Failed to load profile.');
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
    try {
      await api.put('/api/nursery/profile', profile);
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to update profile.');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/nursery/profile/change-password', password);
      setPassword({ currentPassword: '', newPassword: '' });
      setSuccess('Password changed successfully.');
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Failed to change password.'
      );
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profile</h1>
        <p className="text-slate-600">Manage your nursery profile and password</p>
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
      <form
        onSubmit={saveProfile}
        className="grid gap-3 rounded-xl border-2 border-primary/25 bg-white p-4 sm:grid-cols-2"
      >
        <input
          placeholder="Nursery Name"
          value={profile.nurseryName || ''}
          onChange={(e) =>
            setProfile((p) => ({ ...p, nurseryName: e.target.value }))
          }
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <input
          placeholder="Owner Name"
          value={profile.ownerName || ''}
          onChange={(e) => setProfile((p) => ({ ...p, ownerName: e.target.value }))}
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <input
          placeholder="Email"
          value={profile.email || ''}
          onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <input
          placeholder="Phone Number"
          value={profile.phoneNumber || ''}
          onChange={(e) =>
            setProfile((p) => ({ ...p, phoneNumber: e.target.value }))
          }
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
        />
        <input
          placeholder="Address"
          value={profile.address || ''}
          onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary sm:col-span-2"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white sm:col-span-2"
        >
          Save Profile
        </button>
      </form>

      <form
        onSubmit={changePassword}
        className="grid gap-3 rounded-xl border-2 border-primary/25 bg-white p-4 sm:grid-cols-2"
      >
        <input
          type="password"
          placeholder="Current Password"
          value={password.currentPassword}
          onChange={(e) =>
            setPassword((p) => ({ ...p, currentPassword: e.target.value }))
          }
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={password.newPassword}
          onChange={(e) => setPassword((p) => ({ ...p, newPassword: e.target.value }))}
          className="rounded-lg border-2 border-primary/25 px-3 py-2 outline-none focus:border-primary"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 font-semibold text-white sm:col-span-2"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
