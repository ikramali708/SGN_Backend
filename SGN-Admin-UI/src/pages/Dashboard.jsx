import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Card from '../components/Card.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard/stats');
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message ||
              e.message ||
              'Could not load dashboard stats.'
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

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-slate-600">Overview of platform activity</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" />
        <Card
          title="Nurseries"
          value={stats?.totalNurseries ?? '—'}
          icon="🏡"
        />
        <Card title="Plants" value={stats?.totalPlants ?? '—'} icon="🌿" />
        <Card title="Orders" value={stats?.totalOrders ?? '—'} icon="📦" />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold text-primary">Order summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card
            title="Successful"
            value={stats?.successfulOrders ?? '—'}
            icon="✓"
          />
          <Card title="Pending" value={stats?.pendingOrders ?? '—'} icon="⏳" />
          <Card
            title="Cancelled"
            value={stats?.cancelledOrders ?? '—'}
            icon="✕"
          />
        </div>
      </div>
    </div>
  );
}
